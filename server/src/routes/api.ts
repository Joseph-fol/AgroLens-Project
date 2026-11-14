import { Router, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../config/store';
import { optionalAuth, requireAuth, signToken, type AuthenticatedRequest } from '../middleware/auth';
import { fetchNasaPowerForCoordinates } from '../services/nasa/nasaPowerService';
import { evaluateRotationStrategies } from '../services/rotation/scoringEngine';
import type {
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

async function ensureClimateForFarm(farm: Farm, rangeDays = 7) {
  const existing = dbStore.state.climateObservations
    .filter((c) => c.farmId === farm.id && c.rangeDays === rangeDays)
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0];

  if (existing) return existing;

  const fresh = await fetchNasaPowerForCoordinates(farm.id, farm.latitude, farm.longitude, rangeDays);
  dbStore.state.climateObservations.push(fresh);
  dbStore.persist();
  return fresh;
}

function ensureDefaultRotationsForFarm(farmId: string) {
  const existing = dbStore.state.rotationPlans.filter((r) => r.farmId === farmId);
  if (existing.length > 0) return existing;

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
  dbStore.state.rotationPlans.push(...defaults);
  dbStore.persist();
  return defaults;
}

// Health check
apiRouter.get('/health', (_req, res: Response) => {
  res.json({ status: 'ok', service: 'AgroLens API', pilotRegion: 'Oyo State, Nigeria' });
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
    const existing = dbStore.state.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const validRole: UserRole = role === 'extension_officer' ? 'extension_officer' : 'farmer';
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || undefined,
      state: state?.trim() || 'Oyo State',
      lga: lga?.trim() || 'Akinyele',
      role: validRole,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    dbStore.state.users.push(newUser);
    dbStore.persist();

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    });

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  } catch (err) {
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
    const user = dbStore.state.users.find(
      (u) => u.email.toLowerCase() === identifier || (u.phone && u.phone.toLowerCase() === identifier)
    );

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

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = dbStore.state.users.find((u) => u.id === req.user?.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: sanitizeUser(user) });
});

// ================= FARMS =================
apiRouter.get('/farms', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const all = dbStore.state.farms;
  // Return pilot farm + user-owned farms (or all farms for extension officer / demo viewing)
  const visible = req.user
    ? req.user.role === 'extension_officer' || req.user.role === 'admin'
      ? all
      : all.filter((f) => f.ownerId === req.user?.userId || f.isPilotDemo)
    : all.filter((f) => f.isPilotDemo);

  res.json({ farms: visible });
});

apiRouter.get('/farms/:id', optionalAuth, (req, res: Response) => {
  const farm = dbStore.state.farms.find((f) => f.id === req.params.id);
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  const soil = dbStore.state.soilProfiles.find((s) => s.farmId === farm.id) || null;
  res.json({ farm, soil });
});

apiRouter.post('/farms', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
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
  const newFarm: Farm = {
    id: `farm-${Date.now()}`,
    ownerId: req.user?.userId || 'user-farmer-joseph',
    name: body.name.trim(),
    state: body.state?.trim() || 'Oyo State',
    lga: body.lga?.trim() || 'Akinyele',
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
  };

  dbStore.state.farms.push(newFarm);

  // Create default soil profile with explicit null for missing lab fields
  const defaultSoil: SoilProfile = {
    id: `soil-${newFarm.id}`,
    farmId: newFarm.id,
    source: 'untested',
    labName: null,
    samplingDate: null,
    soilTexture: newFarm.soilType,
    ph: null,
    organicMatterPercent: null,
    nitrogenMgKg: null,
    phosphorusMgKg: null,
    potassiumMgKg: null,
    drainageClass: 'Unknown',
    notes: 'Soil laboratory measurements have not been recorded yet.',
    missingFields: ['ph', 'organicMatterPercent', 'nitrogenMgKg', 'phosphorusMgKg', 'potassiumMgKg'],
    updatedAt: now,
  };
  dbStore.state.soilProfiles.push(defaultSoil);
  ensureDefaultRotationsForFarm(newFarm.id);
  dbStore.persist();

  res.status(201).json({ farm: newFarm, soil: defaultSoil });
});

apiRouter.patch('/farms/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const idx = dbStore.state.farms.findIndex((f) => f.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }

  const current = dbStore.state.farms[idx];
  const updates = req.body as Partial<Farm>;
  const updated: Farm = {
    ...current,
    ...updates,
    id: current.id,
    ownerId: current.ownerId,
    updatedAt: new Date().toISOString(),
  };

  dbStore.state.farms[idx] = updated;
  dbStore.persist();
  res.json({ farm: updated });
});

apiRouter.delete('/farms/:id', optionalAuth, (req, res: Response) => {
  const farm = dbStore.state.farms.find((f) => f.id === req.params.id);
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  if (farm.isPilotDemo) {
    res.status(400).json({ error: 'The Oyo Pilot demonstration farm cannot be deleted.' });
    return;
  }
  dbStore.state.farms = dbStore.state.farms.filter((f) => f.id !== req.params.id);
  dbStore.persist();
  res.json({ deleted: true });
});

// ================= SOIL PROFILES =================
apiRouter.get('/farms/:id/soil', (req, res: Response) => {
  const soil = dbStore.state.soilProfiles.find((s) => s.farmId === req.params.id) || null;
  res.json({ soil });
});

apiRouter.post('/farms/:id/soil', optionalAuth, (req, res: Response) => {
  const farm = dbStore.state.farms.find((f) => f.id === req.params.id);
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

  const soilProfile: SoilProfile = {
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

  const existingIdx = dbStore.state.soilProfiles.findIndex((s) => s.farmId === farm.id);
  if (existingIdx >= 0) {
    dbStore.state.soilProfiles[existingIdx] = soilProfile;
  } else {
    dbStore.state.soilProfiles.push(soilProfile);
  }
  dbStore.persist();

  res.json({ soil: soilProfile });
});

// ================= CROPS =================
apiRouter.get('/crops', (_req, res: Response) => {
  res.json({ crops: dbStore.state.crops });
});

apiRouter.get('/crops/:id', (req, res: Response) => {
  const crop = dbStore.state.crops.find((c) => c.id === req.params.id.toLowerCase());
  if (!crop) {
    res.status(404).json({ error: 'Crop not found.' });
    return;
  }
  res.json({ crop });
});

// ================= ENVIRONMENTAL / NASA DATA =================
apiRouter.post('/climate/fetch', async (req, res: Response) => {
  try {
    const { farmId, rangeDays = 7, forceRefresh = false } = req.body as {
      farmId?: string;
      rangeDays?: number;
      forceRefresh?: boolean;
    };

    const farm = dbStore.state.farms.find((f) => f.id === farmId) || dbStore.state.farms[0];
    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }

    const days = Number(rangeDays) || 7;
    if (!forceRefresh) {
      const cached = dbStore.state.climateObservations
        .filter((c) => c.farmId === farm.id && c.rangeDays === days)
        .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0];
      if (cached) {
        res.json({ climate: cached, cached: true });
        return;
      }
    }

    const fresh = await fetchNasaPowerForCoordinates(farm.id, farm.latitude, farm.longitude, days);
    // Keep up to latest observation per (farmId, rangeDays)
    dbStore.state.climateObservations = dbStore.state.climateObservations.filter(
      (c) => !(c.farmId === farm.id && c.rangeDays === days)
    );
    dbStore.state.climateObservations.push(fresh);
    dbStore.persist();

    res.json({ climate: fresh, cached: false });
  } catch (err) {
    res.status(502).json({ error: 'Failed to retrieve NASA environmental observations.' });
  }
});

apiRouter.get('/climate/:farmId', async (req, res: Response) => {
  const farm = dbStore.state.farms.find((f) => f.id === req.params.farmId);
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }
  const rangeDays = Number(req.query.rangeDays) || 7;
  const climate = await ensureClimateForFarm(farm, rangeDays);
  res.json({ climate });
});

// ================= ROTATIONS =================
apiRouter.get('/rotations/:farmId', (req, res: Response) => {
  const plans = ensureDefaultRotationsForFarm(req.params.farmId);
  res.json({ rotations: plans });
});

apiRouter.post('/rotations', (req, res: Response) => {
  const { farmId, label, sequence } = req.body as {
    farmId?: string;
    label?: string;
    sequence?: string[];
  };

  if (!farmId || !label || !Array.isArray(sequence) || sequence.length < 2) {
    res.status(400).json({ error: 'Farm ID, label, and at least 2 crops in sequence are required.' });
    return;
  }

  const existing = ensureDefaultRotationsForFarm(farmId);
  const nextCodeLetter = String.fromCharCode(65 + existing.length);
  const newPlan: RotationPlan = {
    id: `rot-${farmId}-${Date.now()}`,
    farmId,
    code: `Strategy ${nextCodeLetter}`,
    label: label.trim(),
    category: 'Custom',
    sequence: sequence.map((s) => s.trim()),
    isBaseline: false,
    createdAt: new Date().toISOString(),
  };

  dbStore.state.rotationPlans.push(newPlan);
  dbStore.persist();
  res.status(201).json({ rotation: newPlan });
});

// ================= ANALYSES =================
apiRouter.post('/analyses', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmId, priorities, rangeDays = 30 } = req.body as {
      farmId?: string;
      priorities?: Partial<FarmerPriorities>;
      rangeDays?: number;
    };

    const farm = dbStore.state.farms.find((f) => f.id === farmId) || dbStore.state.farms[0];
    if (!farm) {
      res.status(404).json({ error: 'Farm not found.' });
      return;
    }

    const soil = dbStore.state.soilProfiles.find((s) => s.farmId === farm.id) || null;
    const climate = await ensureClimateForFarm(farm, Number(rangeDays) || 30);
    const plans = ensureDefaultRotationsForFarm(farm.id);

    const mergedPriorities: FarmerPriorities = {
      soilHealth: priorities?.soilHealth ?? DEFAULT_PRIORITIES.soilHealth,
      waterConservation: priorities?.waterConservation ?? DEFAULT_PRIORITIES.waterConservation,
      climateResilience: priorities?.climateResilience ?? DEFAULT_PRIORITIES.climateResilience,
      economicSuitability: priorities?.economicSuitability ?? DEFAULT_PRIORITIES.economicSuitability,
      erosionReduction: priorities?.erosionReduction ?? DEFAULT_PRIORITIES.erosionReduction,
    };

    const analysis = evaluateRotationStrategies({
      farm,
      soil,
      climate,
      plans,
      priorities: mergedPriorities,
      userId: req.user?.userId || 'user-farmer-joseph',
    });

    dbStore.state.analyses.push(analysis);
    dbStore.persist();

    res.status(201).json({ analysis, climate, soil });
  } catch {
    res.status(500).json({ error: 'Failed to run rotation analysis.' });
  }
});

apiRouter.get('/analyses/farm/:farmId', async (req, res: Response) => {
  const farm = dbStore.state.farms.find((f) => f.id === req.params.farmId);
  if (!farm) {
    res.status(404).json({ error: 'Farm not found.' });
    return;
  }

  let latest = dbStore.state.analyses
    .filter((a) => a.farmId === farm.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (!latest) {
    const soil = dbStore.state.soilProfiles.find((s) => s.farmId === farm.id) || null;
    const climate = await ensureClimateForFarm(farm, 30);
    const plans = ensureDefaultRotationsForFarm(farm.id);
    latest = evaluateRotationStrategies({
      farm,
      soil,
      climate,
      plans,
      priorities: DEFAULT_PRIORITIES,
      userId: farm.ownerId,
    });
    dbStore.state.analyses.push(latest);
    dbStore.persist();
  }

  res.json({ analysis: latest });
});

apiRouter.get('/analyses/:id', (req, res: Response) => {
  const analysis = dbStore.state.analyses.find((a) => a.id === req.params.id);
  if (!analysis) {
    res.status(404).json({ error: 'Analysis not found.' });
    return;
  }
  res.json({ analysis });
});

// ================= EXTENSION OFFICER REVIEWS =================
apiRouter.get('/reviews/:analysisId', (req, res: Response) => {
  const reviews = dbStore.state.reviews
    .filter((r) => r.analysisId === req.params.analysisId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json({ reviews });
});

apiRouter.post('/reviews', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
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

  const newReview: ExtensionReview = {
    id: `rev-${Date.now()}`,
    analysisId,
    farmId: farmId || 'farm-oyo-pilot-1',
    reviewerId: req.user?.userId || 'user-extension-adebayo',
    reviewerName: reviewerName || req.user?.fullName || 'Dr. Adebayo Adeyemi',
    reviewerRole: reviewerRole || (req.user?.role === 'extension_officer' ? 'Agricultural Extension Officer' : 'Agronomy Reviewer'),
    status: status || 'Reviewed - Endorsed',
    comments: comments.trim(),
    flaggedRisks: Array.isArray(flaggedRisks) ? flaggedRisks.filter(Boolean) : [],
    missingInfoIdentified: Array.isArray(missingInfoIdentified) ? missingInfoIdentified.filter(Boolean) : [],
    createdAt: new Date().toISOString(),
  };

  dbStore.state.reviews.push(newReview);
  dbStore.persist();
  res.status(201).json({ review: newReview });
});

// ================= CONTACT FORM =================
apiRouter.post('/contact', (req, res: Response) => {
  const { name, email, message } = req.body as { name?: string; email?: string; message?: string };
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }
  const entry = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  dbStore.state.contactMessages.push(entry);
  dbStore.persist();
  res.status(201).json({ received: true, id: entry.id });
});
