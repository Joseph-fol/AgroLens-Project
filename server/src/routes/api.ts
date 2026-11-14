import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabaseStatus } from '../config/database';
import { optionalAuth, requireAuth, signToken, type AuthenticatedRequest } from '../middleware/auth';
import {
  AnalysisModel,
  ClimateObservationModel,
  ContactMessageModel,
  CropModel,
  FarmModel,
  ReviewModel,
  RotationPlanModel,
  SoilProfileModel,
  UserModel,
} from '../models/schemas';
import { fetchNasaPowerForCoordinates } from '../services/nasa/nasaPowerService';
import { evaluateRotationStrategies } from '../services/rotation/scoringEngine';
import {
  forwardGeocodePlace,
  NIGERIA_LOCATIONS,
  reverseGeocodeCoordinates,
} from '../services/location/nigeriaLocations';
import type {
  ClimateObservationRecord,
  ExtensionReview,
  FarmerPriorities,
  Farm,
  RotationPlan,
  SoilProfile,
  User,
  UserRole,
} from '../types/domain';

export const apiRouter = Router();

const DEFAULT_PRIORITIES: FarmerPriorities = {
  soilHealth: 35,
  waterConservation: 25,
  climateResilience: 15,
  economicSuitability: 15,
  erosionReduction: 10,
};

function sanitizeUser(u: User) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    state: u.state,
    lga: u.lga,
    role: u.role,
    createdAt: u.createdAt,
  };
}

function stripMongoId<T extends object>(doc: T | null): T | null {
  if (!doc) return null;
  const plain = { ...(doc as Record<string, unknown>) };
  delete plain._id;
  return plain as T;
}

async function ensureClimateForFarm(farm: Farm, rangeDays = 7): Promise<ClimateObservationRecord> {
  const existing = await ClimateObservationModel.findOne({ farmId: farm.id, rangeDays })
    .sort({ fetchedAt: -1 })
    .lean<ClimateObservationRecord>();

  if (existing) {
    return stripMongoId(existing)!;
  }

  const fresh = await fetchNasaPowerForCoordinates(farm.id, farm.latitude, farm.longitude, rangeDays);
  const created = await ClimateObservationModel.create(fresh);
  return created.toJSON() as ClimateObservationRecord;
}

async function ensureDefaultRotationsForFarm(farmId: string): Promise<RotationPlan[]> {
  const existing = await RotationPlanModel.find({ farmId }).sort({ createdAt: 1 }).lean<RotationPlan[]>();
  if (existing.length > 0) {
    return existing.map((doc) => stripMongoId(doc)!);
  }

  const now = new Date().toISOString();
  const defaults: RotationPlan[] = [
    {
      id: `rot-${farmId}-a`,
      farmId,
      code: 'Strategy A',
      label: 'Existing Practice (Continuous Maize)',
      category: 'Baseline',
      sequence: ['Maize', 'Maize', 'Maize'],
      isBaseline: true,
      createdAt: now,
    },
    {
      id: `rot-${farmId}-b`,
      farmId,
      code: 'Strategy B',
      label: 'Balanced Legume Rotation',
      category: 'Balanced',
      sequence: ['Maize', 'Cowpea', 'Maize'],
      isBaseline: false,
      createdAt: now,
    },
    {
      id: `rot-${farmId}-c`,
      farmId,
      code: 'Strategy C',
      label: 'Commercial Legume Rotation',
      category: 'Maize-Focus',
      sequence: ['Maize', 'Soybean', 'Maize'],
      isBaseline: false,
      createdAt: now,
    },
    {
      id: `rot-${farmId}-d`,
      farmId,
      code: 'Strategy D',
      label: 'Three-Crop Diversified',
      category: 'Legume-First',
      sequence: ['Maize', 'Cowpea', 'Soybean'],
      isBaseline: false,
      createdAt: now,
    },
  ];
  await RotationPlanModel.insertMany(defaults);
  return defaults;
}

// Health check including live MongoDB connection status
apiRouter.get('/health', async (_req, res: Response) => {
  const db = getDatabaseStatus();
  const [farmsCount, cropsCount, analysesCount] = await Promise.all([
    FarmModel.countDocuments(),
    CropModel.countDocuments(),
    AnalysisModel.countDocuments(),
  ]);
  res.json({
    status: 'ok',
    service: 'AgroLens API',
    pilotRegion: 'Oyo State, Nigeria',
    orm: 'Mongoose',
    database: {
      ...db,
      collections: {
        farms: farmsCount,
        crops: cropsCount,
        analyses: analysesCount,
      },
    },
  });
});

// ================= AUTHENTICATION =================
apiRouter.post('/auth/register', async (req, res: Response) => {
  try {
    const { fullName, email, phone, state, lga, password, role } = req.body as {
      fullName?: string;
      email?: string;
      phone?: string;
      state?: string;
      lga?: string;
      password?: string;
      role?: UserRole;
    };

    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Full name, email, and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const validRole: UserRole = role === 'extension_officer' ? 'extension_officer' : 'farmer';
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await UserModel.create({
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || undefined,
      state: state?.trim() || 'Oyo State',
      lga: lga?.trim() || 'Akinyele',
      role: validRole,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const newUser = created.toJSON() as User;
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  } catch {
    res.status(500).json({ error: 'Failed to register account.' });
  }
});

apiRouter.post('/auth/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email or phone and password are required.' });
      return;
    }

    const identifier = email.trim().toLowerCase();
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: email.trim() }],
    }).lean<User>();

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    res.json({ token, user: sanitizeUser(user) });
  } catch {
    res.status(500).json({ error: 'Login failed.' });
  }
});

apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = await UserModel.findOne({ id: req.user?.userId }).lean<User>();
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

// ================= FARMS =================
apiRouter.get('/farms', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const filter = req.user
    ? req.user.role === 'extension_officer' || req.user.role === 'admin'
      ? {}
      : { $or: [{ ownerId: req.user.userId }, { isPilotDemo: true }] }
    : { isPilotDemo: true };

  const farms = await FarmModel.find(filter).sort({ createdAt: 1 }).lean<Farm[]>();
  res.json({ farms: farms.map((f) => stripMongoId(f)!) });
});

apiRouter.get('/farms/:id', optionalAuth, async (req, res: Response) => {
  const farmDoc = await FarmModel.findOne({ id: req.params.id }).lean<Farm>();
  if (!farmDoc) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  const soilDoc = await SoilProfileModel.findOne({ farmId: farmDoc.id }).lean<SoilProfile>();
  res.json({ farm: stripMongoId(farmDoc), soil: stripMongoId(soilDoc) });
});

apiRouter.post('/farms', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body as Partial<Farm>;
    if (!body.name || body.latitude === undefined || body.longitude === undefined || !body.sizeHectares) {
      res.status(400).json({ error: 'Farm name, coordinates, and size in hectares are required.' });
      return;
    }

    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    const size = Number(body.sizeHectares);

    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: 'Invalid geographic coordinates.' });
      return;
    }
    if (Number.isNaN(size) || size <= 0) {
      res.status(400).json({ error: 'Farm size must be greater than zero.' });
      return;
    }

    const now = new Date().toISOString();
    const delta = Math.sqrt(size) * 0.0008;
    const farmId = `farm-${Date.now()}`;

    let resolvedState = body.state?.trim() || '';
    let resolvedLga = body.lga?.trim() || '';
    let resolvedCity = body.city?.trim() || '';

    if (!resolvedState || !resolvedLga || !resolvedCity) {
      const geo = await reverseGeocodeCoordinates(lat, lng);
      if (!resolvedState) resolvedState = geo.state;
      if (!resolvedLga) resolvedLga = geo.lga;
      if (!resolvedCity) resolvedCity = geo.city;
    }

    const createdFarm = await FarmModel.create({
      id: farmId,
      ownerId: req.user?.userId || 'user-farmer-joseph',
      name: body.name.trim(),
      state: resolvedState || 'Oyo State',
      lga: resolvedLga || 'Akinyele',
      city: resolvedCity || '',
      latitude: Number(lat.toFixed(5)),
      longitude: Number(lng.toFixed(5)),
      boundary:
        body.boundary && body.boundary.length >= 3
          ? body.boundary
          : [
              { lat: lat + delta, lng: lng - delta },
              { lat: lat + delta, lng: lng + delta },
              { lat: lat - delta, lng: lng + delta },
              { lat: lat - delta, lng: lng - delta },
            ],
      sizeHectares: size,
      soilType: body.soilType || 'Loamy Soil',
      waterSource: body.waterSource || 'Rainfed (Seasonal)',
      currentCrop: body.currentCrop || 'Maize',
      previousCrops: Array.isArray(body.previousCrops) ? body.previousCrops : ['Maize'],
      farmingPractice: body.farmingPractice || 'Mixed Rainfed Smallholder',
      lastPlantingDate: body.lastPlantingDate || null,
      expectedHarvestDate: body.expectedHarvestDate || null,
      isPilotDemo: false,
      status: 'Active',
      updatedAt: now,
      createdAt: now,
    });

    const createdSoil = await SoilProfileModel.create({
      id: `soil-${farmId}`,
      farmId,
      source: 'untested',
      labName: null,
      samplingDate: null,
      soilTexture: createdFarm.soilType,
      ph: null,
      organicMatterPercent: null,
      nitrogenMgKg: null,
      phosphorusMgKg: null,
      potassiumMgKg: null,
      drainageClass: 'Unknown',
      notes: 'Soil laboratory measurements have not been recorded yet.',
      missingFields: ['ph', 'organicMatterPercent', 'nitrogenMgKg', 'phosphorusMgKg', 'potassiumMgKg'],
      updatedAt: now,
    });

    await ensureDefaultRotationsForFarm(farmId);

    res.status(201).json({
      farm: createdFarm.toJSON(),
      soil: createdSoil.toJSON(),
    });
  } catch {
    res.status(500).json({ error: 'Failed to create farm in MongoDB.' });
  }
});

apiRouter.patch('/farms/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = { ...(req.body as Partial<Farm>) };
    delete updates.id;
    delete updates.ownerId;
    updates.updatedAt = new Date().toISOString();

    const updated = await FarmModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean<Farm>();

    if (!updated) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }

    res.json({ farm: stripMongoId(updated) });
  } catch {
    res.status(400).json({ error: 'Failed to update farm record.' });
  }
});

apiRouter.delete('/farms/:id', optionalAuth, async (req, res: Response) => {
  const farm = await FarmModel.findOne({ id: req.params.id }).lean<Farm>();
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  if (farm.isPilotDemo) {
    res.status(400).json({ error: 'The Oyo Pilot demonstration farm cannot be deleted.' });
    return;
  }

  await Promise.all([
    FarmModel.deleteOne({ id: req.params.id }),
    SoilProfileModel.deleteMany({ farmId: req.params.id }),
    RotationPlanModel.deleteMany({ farmId: req.params.id }),
    ClimateObservationModel.deleteMany({ farmId: req.params.id }),
    AnalysisModel.deleteMany({ farmId: req.params.id }),
    ReviewModel.deleteMany({ farmId: req.params.id }),
  ]);

  res.json({ deleted: true });
});

// ================= SOIL PROFILES =================
apiRouter.get('/farms/:id/soil', async (req, res: Response) => {
  const soil = await SoilProfileModel.findOne({ farmId: req.params.id }).lean<SoilProfile>();
  res.json({ soil: stripMongoId(soil) });
});

apiRouter.post('/farms/:id/soil', optionalAuth, async (req, res: Response) => {
  const farm = await FarmModel.findOne({ id: req.params.id }).lean<Farm>();
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }

  const body = req.body as Partial<SoilProfile>;
  const parseNullableNum = (val: unknown): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return Number.isNaN(n) ? null : n;
  };

  const ph = parseNullableNum(body.ph);
  const om = parseNullableNum(body.organicMatterPercent);
  const nVal = parseNullableNum(body.nitrogenMgKg);
  const pVal = parseNullableNum(body.phosphorusMgKg);
  const kVal = parseNullableNum(body.potassiumMgKg);

  const missingFields: string[] = [];
  if (ph === null) missingFields.push('ph');
  if (om === null) missingFields.push('organicMatterPercent');
  if (nVal === null) missingFields.push('nitrogenMgKg');
  if (pVal === null) missingFields.push('phosphorusMgKg');
  if (kVal === null) missingFields.push('potassiumMgKg');

  const payload: SoilProfile = {
    id: `soil-${farm.id}`,
    farmId: farm.id,
    source: body.source || 'farmer_reported',
    labName: body.labName || null,
    samplingDate: body.samplingDate || null,
    soilTexture: body.soilTexture || farm.soilType,
    ph,
    organicMatterPercent: om,
    nitrogenMgKg: nVal,
    phosphorusMgKg: pVal,
    potassiumMgKg: kVal,
    drainageClass: body.drainageClass || 'Well-drained',
    notes: body.notes || '',
    missingFields,
    updatedAt: new Date().toISOString(),
  };

  const saved = await SoilProfileModel.findOneAndUpdate(
    { farmId: farm.id },
    { $set: payload },
    { new: true, upsert: true, runValidators: true }
  ).lean<SoilProfile>();

  res.json({ soil: stripMongoId(saved) });
});

// ================= CROPS =================
apiRouter.get('/crops', async (_req, res: Response) => {
  const crops = await CropModel.find({}).lean();
  res.json({ crops: crops.map((c) => stripMongoId(c)!) });
});

apiRouter.get('/crops/:id', async (req, res: Response) => {
  const crop = await CropModel.findOne({ id: req.params.id.toLowerCase() }).lean();
  if (!crop) {
    res.status(404).json({ error: 'Crop not found.' });
    return;
  }
  res.json({ crop: stripMongoId(crop) });
});

// ================= ENVIRONMENTAL / NASA DATA =================
apiRouter.post('/climate/fetch', async (req, res: Response) => {
  try {
    const { farmId, rangeDays = 7, forceRefresh = false } = req.body as {
      farmId?: string;
      rangeDays?: number;
      forceRefresh?: boolean;
    };

    const farm = farmId
      ? await FarmModel.findOne({ id: farmId }).lean<Farm>()
      : await FarmModel.findOne({}).lean<Farm>();

    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }

    const days = Number(rangeDays) || 7;
    if (!forceRefresh) {
      const cached = await ClimateObservationModel.findOne({ farmId: farm.id, rangeDays: days })
        .sort({ fetchedAt: -1 })
        .lean<ClimateObservationRecord>();
      if (cached) {
        res.json({ climate: stripMongoId(cached), cached: true });
        return;
      }
    }

    const fresh = await fetchNasaPowerForCoordinates(farm.id, farm.latitude, farm.longitude, days);
    await ClimateObservationModel.deleteMany({ farmId: farm.id, rangeDays: days });
    const created = await ClimateObservationModel.create(fresh);

    res.json({ climate: created.toJSON(), cached: false });
  } catch {
    res.status(502).json({ error: 'Failed to retrieve NASA environmental observations.' });
  }
});

apiRouter.get('/climate/:farmId', async (req, res: Response) => {
  const farm = await FarmModel.findOne({ id: req.params.farmId }).lean<Farm>();
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  const rangeDays = Number(req.query.rangeDays) || 7;
  const climate = await ensureClimateForFarm(farm, rangeDays);
  res.json({ climate });
});

// ================= ROTATIONS =================
apiRouter.get('/rotations/:farmId', async (req, res: Response) => {
  const plans = await ensureDefaultRotationsForFarm(req.params.farmId);
  res.json({ rotations: plans });
});

apiRouter.post('/rotations', async (req, res: Response) => {
  const { farmId, label, sequence } = req.body as {
    farmId?: string;
    label?: string;
    sequence?: string[];
  };

  if (!farmId || !label || !Array.isArray(sequence) || sequence.length < 2) {
    res.status(400).json({ error: 'Farm ID, label, and at least 2 crops in sequence are required.' });
    return;
  }

  const existing = await ensureDefaultRotationsForFarm(farmId);
  const nextCodeLetter = String.fromCharCode(65 + existing.length);

  const created = await RotationPlanModel.create({
    id: `rot-${farmId}-${Date.now()}`,
    farmId,
    code: `Strategy ${nextCodeLetter}`,
    label: label.trim(),
    category: 'Custom',
    sequence: sequence.map((s) => s.trim()),
    isBaseline: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ rotation: created.toJSON() });
});

// ================= ANALYSES =================
apiRouter.post('/analyses', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId, priorities, rangeDays = 30 } = req.body as {
      farmId?: string;
      priorities?: Partial<FarmerPriorities>;
      rangeDays?: number;
    };

    const farm = farmId
      ? await FarmModel.findOne({ id: farmId }).lean<Farm>()
      : await FarmModel.findOne({}).lean<Farm>();

    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }

    const soilDoc = await SoilProfileModel.findOne({ farmId: farm.id }).lean<SoilProfile>();
    const soil = stripMongoId(soilDoc);
    const climate = await ensureClimateForFarm(farm, Number(rangeDays) || 30);
    const plans = await ensureDefaultRotationsForFarm(farm.id);

    const mergedPriorities: FarmerPriorities = {
      soilHealth: priorities?.soilHealth ?? DEFAULT_PRIORITIES.soilHealth,
      waterConservation: priorities?.waterConservation ?? DEFAULT_PRIORITIES.waterConservation,
      climateResilience: priorities?.climateResilience ?? DEFAULT_PRIORITIES.climateResilience,
      economicSuitability: priorities?.economicSuitability ?? DEFAULT_PRIORITIES.economicSuitability,
      erosionReduction: priorities?.erosionReduction ?? DEFAULT_PRIORITIES.erosionReduction,
    };

    const analysisData = evaluateRotationStrategies({
      farm: stripMongoId(farm)!,
      soil,
      climate,
      plans,
      priorities: mergedPriorities,
      userId: req.user?.userId || 'user-farmer-joseph',
    });

    const savedAnalysis = await AnalysisModel.create(analysisData);
    res.status(201).json({ analysis: savedAnalysis.toJSON(), climate, soil });
  } catch {
    res.status(500).json({ error: 'Failed to run rotation analysis.' });
  }
});

apiRouter.get('/analyses/farm/:farmId', async (req, res: Response) => {
  const farm = await FarmModel.findOne({ id: req.params.farmId }).lean<Farm>();
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }

  const latest = await AnalysisModel.findOne({ farmId: farm.id }).sort({ createdAt: -1 }).lean();
  if (latest) {
    res.json({ analysis: stripMongoId(latest) });
    return;
  }

  const soilDoc = await SoilProfileModel.findOne({ farmId: farm.id }).lean<SoilProfile>();
  const soil = stripMongoId(soilDoc);
  const climate = await ensureClimateForFarm(farm, 30);
  const plans = await ensureDefaultRotationsForFarm(farm.id);

  const generated = evaluateRotationStrategies({
    farm: stripMongoId(farm)!,
    soil,
    climate,
    plans,
    priorities: DEFAULT_PRIORITIES,
    userId: farm.ownerId,
  });

  const saved = await AnalysisModel.create(generated);
  res.json({ analysis: saved.toJSON() });
});

apiRouter.get('/analyses/:id', async (req, res: Response) => {
  const analysis = await AnalysisModel.findOne({ id: req.params.id }).lean();
  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found.' });
    return;
  }
  res.json({ analysis: stripMongoId(analysis) });
});

// ================= EXTENSION OFFICER REVIEWS =================
apiRouter.get('/reviews/:analysisId', async (req, res: Response) => {
  const reviews = await ReviewModel.find({ analysisId: req.params.analysisId })
    .sort({ createdAt: -1 })
    .lean<ExtensionReview[]>();
  res.json({ reviews: reviews.map((r) => stripMongoId(r)!) });
});

apiRouter.post('/reviews', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { analysisId, farmId, status, comments, flaggedRisks, missingInfoIdentified, reviewerName, reviewerRole } =
    req.body as {
      analysisId?: string;
      farmId?: string;
      status?: ExtensionReview['status'];
      comments?: string;
      flaggedRisks?: string[];
      missingInfoIdentified?: string[];
      reviewerName?: string;
      reviewerRole?: string;
    };

  if (!analysisId || !comments) {
    res.status(400).json({ error: 'Analysis ID and review comments are required.' });
    return;
  }

  const created = await ReviewModel.create({
    id: `rev-${Date.now()}`,
    analysisId,
    farmId: farmId || 'farm-oyo-pilot-1',
    reviewerId: req.user?.userId || 'user-extension-adebayo',
    reviewerName: reviewerName || req.user?.fullName || 'Dr. Adebayo Adeyemi',
    reviewerRole:
      reviewerRole || (req.user?.role === 'extension_officer' ? 'Agricultural Extension Officer' : 'Agronomy Reviewer'),
    status: status || 'Reviewed - Endorsed',
    comments: comments.trim(),
    flaggedRisks: Array.isArray(flaggedRisks) ? flaggedRisks.filter(Boolean) : [],
    missingInfoIdentified: Array.isArray(missingInfoIdentified) ? missingInfoIdentified.filter(Boolean) : [],
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ review: created.toJSON() });
});

// ================= CONTACT FORM =================
apiRouter.post('/contact', async (req, res: Response) => {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  const created = await ContactMessageModel.create({
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ received: true, id: created.id });
});

// ================= NIGERIA LOCATIONS & GEOCODING API =================
apiRouter.get('/locations/states', (_req, res: Response) => {
  const states = NIGERIA_LOCATIONS.map((s) => ({
    name: s.name,
    capital: s.capital,
    zone: s.zone,
    lat: s.lat,
    lng: s.lng,
  }));
  res.json({ states });
});

apiRouter.get('/locations/lgas', (req, res: Response) => {
  const stateParam = String(req.query.state || 'Oyo State').trim().toLowerCase();
  const cleanParam = stateParam.replace(/\s*state\s*/g, '').trim();
  const stateEntry =
    NIGERIA_LOCATIONS.find((s) => {
      const target = s.name.toLowerCase().replace(/\s*state\s*/g, '').trim();
      return s.name.toLowerCase() === stateParam || target === cleanParam;
    }) || NIGERIA_LOCATIONS[0];

  res.json({
    state: stateEntry.name,
    lgas: stateEntry.lgas,
  });
});

apiRouter.get('/locations/cities', (req, res: Response) => {
  const stateParam = String(req.query.state || 'Oyo State').trim().toLowerCase();
  const lgaParam = String(req.query.lga || '').trim().toLowerCase();

  const stateEntry =
    NIGERIA_LOCATIONS.find((s) => s.name.toLowerCase() === stateParam) || NIGERIA_LOCATIONS[0];
  const lgaEntry =
    stateEntry.lgas.find((l) => l.name.toLowerCase() === lgaParam) || stateEntry.lgas[0];

  res.json({
    state: stateEntry.name,
    lga: lgaEntry.name,
    lat: lgaEntry.lat,
    lng: lgaEntry.lng,
    cities: lgaEntry.cities,
  });
});

apiRouter.get('/locations/reverse', async (req, res: Response) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Valid lat and lng query parameters are required.' });
    return;
  }
  const result = await reverseGeocodeCoordinates(lat, lng);
  res.json(result);
});

apiRouter.get('/locations/geocode', async (req, res: Response) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.status(400).json({ error: 'Query parameter q is required.' });
    return;
  }
  const result = await forwardGeocodePlace(q);
  res.json({ result });
});

