import mongoose, { Schema } from 'mongoose';
import type {
  AnalysisRecord,
  ClimateObservationRecord,
  ContactMessage,
  CropProfile,
  ExtensionReview,
  Farm,
  RotationPlan,
  SoilProfile,
  User,
} from '../types/domain';

const schemaOptions = {
  timestamps: false as const,
  versionKey: false as const,
  toJSON: {
    transform(_doc: unknown, ret: Record<string, unknown>) {
      delete ret._id;
      return ret;
    },
  },
};

const userSchema = new Schema<User>(
  {
    id: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: undefined },
    state: { type: String, required: true, default: 'Oyo State' },
    lga: { type: String, default: 'Akinyele' },
    city: { type: String, default: undefined },
    role: { type: String, enum: ['farmer', 'extension_officer', 'admin'], default: 'farmer' },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { ...schemaOptions, collection: 'users' }
);

const coordinateSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const farmSchema = new Schema<Farm>(
  {
    id: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true },
    lga: { type: String, required: true },
    city: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    boundary: { type: [coordinateSchema], default: [] },
    sizeHectares: { type: Number, required: true, min: 0.05 },
    soilType: { type: String, required: true },
    waterSource: { type: String, required: true },
    currentCrop: { type: String, required: true },
    previousCrops: { type: [String], default: [] },
    farmingPractice: { type: String, required: true },
    lastPlantingDate: { type: String, default: null },
    expectedHarvestDate: { type: String, default: null },
    isPilotDemo: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Planning', 'Fallow'], default: 'Active' },
    updatedAt: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { ...schemaOptions, collection: 'farms' }
);

const soilProfileSchema = new Schema<SoilProfile>(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmId: { type: String, required: true, unique: true, index: true },
    source: {
      type: String,
      enum: ['laboratory_test', 'farmer_reported', 'untested'],
      required: true,
      default: 'untested',
    },
    labName: { type: String, default: null },
    samplingDate: { type: String, default: null },
    soilTexture: { type: String, required: true },
    // Missing values are strictly null, never zero
    ph: { type: Number, default: null },
    organicMatterPercent: { type: Number, default: null },
    nitrogenMgKg: { type: Number, default: null },
    phosphorusMgKg: { type: Number, default: null },
    potassiumMgKg: { type: Number, default: null },
    drainageClass: {
      type: String,
      enum: ['Well-drained', 'Moderately drained', 'Poorly drained', 'Unknown'],
      default: 'Unknown',
    },
    notes: { type: String, default: '' },
    missingFields: { type: [String], default: [] },
    updatedAt: { type: String, required: true },
  },
  { ...schemaOptions, collection: 'soil_profiles' }
);

const cropSchema = new Schema<CropProfile>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    scientificName: { type: String, required: true },
    family: { type: String, required: true },
    summary: { type: String, required: true },
    durationDaysMin: { type: Number, required: true },
    durationDaysMax: { type: Number, required: true },
    oyoPlantingWindows: {
      earlySeason: { type: String, required: true },
      lateSeason: { type: String, required: true },
      harvestWindow: { type: String, required: true },
    },
    waterRequirementMmMin: { type: Number, required: true },
    waterRequirementMmMax: { type: Number, required: true },
    tempOptimalMinC: { type: Number, required: true },
    tempOptimalMaxC: { type: Number, required: true },
    heatStressThresholdC: { type: Number, required: true },
    phMin: { type: Number, required: true },
    phMax: { type: Number, required: true },
    keyNutrients: { type: [String], default: [] },
    rootCharacteristics: { type: String, required: true },
    nitrogenFixingPotential: {
      capable: { type: Boolean, required: true },
      estimateKgHa: { type: String, required: true },
      managementCaveat: { type: String, required: true },
    },
    soilHealthContributions: { type: [String], default: [] },
    managementRequirements: { type: [String], default: [] },
    pestAndDiseaseRisks: { type: [String], default: [] },
    growingTips: { type: [String], default: [] },
    yieldPotentialTonHa: { type: Number, required: true },
    references: [
      {
        source: { type: String, required: true },
        title: { type: String, required: true },
        context: { type: String, required: true },
      },
    ],
  },
  { ...schemaOptions, collection: 'crop_catalog' }
);

const dailyObsSchema = new Schema(
  {
    date: { type: String, required: true },
    rainfallMm: { type: Number, default: null },
    tempMeanC: { type: Number, default: null },
    tempMaxC: { type: Number, default: null },
    tempMinC: { type: Number, default: null },
    relativeHumidityPct: { type: Number, default: null },
    solarRadiationMjM2: { type: Number, default: null },
    surfaceSoilWetnessPct: { type: Number, default: null },
    rootZoneSoilWetnessPct: { type: Number, default: null },
  },
  { _id: false }
);

const provenanceSchema = new Schema(
  {
    datasetName: { type: String, required: true },
    role: { type: String, required: true },
    measurementType: { type: String, required: true },
    spatialResolution: { type: String, required: true },
    temporalResolution: { type: String, required: true },
    parameters: { type: [String], default: [] },
    units: { type: Schema.Types.Mixed, default: {} },
    retrievalDate: { type: String, required: true },
    archiveWindowUsed: { type: String, required: true },
    qualityFlag: { type: String, required: true },
    limitations: { type: String, required: true },
  },
  { _id: false }
);

const climateObservationSchema = new Schema<ClimateObservationRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmId: { type: String, required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    rangeDays: { type: Number, required: true, index: true },
    fetchedAt: { type: String, required: true },
    isLiveNasaFetch: { type: Boolean, required: true },
    observations: { type: [dailyObsSchema], default: [] },
    summary: {
      totalRainfallMm: { type: Number, required: true },
      avgDailyRainfallMm: { type: Number, required: true },
      avgTempC: { type: Number, required: true },
      maxTempC: { type: Number, required: true },
      minTempC: { type: Number, required: true },
      avgHumidityPct: { type: Number, required: true },
      avgSoilMoisturePct: { type: Number, required: true },
      avgRootZoneMoisturePct: { type: Number, required: true },
      heatStressDays: { type: Number, required: true },
      drySpellDays: { type: Number, required: true },
      moistureStatus: { type: String, enum: ['Optimal', 'Moderate', 'Low', 'Excess'], required: true },
      rainfallTrendPct: { type: Number, default: null },
      tempTrendDeltaC: { type: Number, default: null },
    },
    provenance: { type: [provenanceSchema], default: [] },
  },
  { ...schemaOptions, collection: 'climate_observations' }
);
climateObservationSchema.index({ farmId: 1, rangeDays: 1, fetchedAt: -1 });

const rotationPlanSchema = new Schema<RotationPlan>(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    category: {
      type: String,
      enum: ['Baseline', 'Balanced', 'Legume-First', 'Maize-Focus', 'Custom'],
      default: 'Custom',
    },
    sequence: { type: [String], required: true },
    isBaseline: { type: Boolean, default: false },
    createdAt: { type: String, required: true },
  },
  { ...schemaOptions, collection: 'rotation_plans' }
);

const strategyEvaluationSchema = new Schema(
  {
    rotationPlanId: { type: String, required: true },
    code: { type: String, required: true },
    label: { type: String, required: true },
    sequence: { type: [String], required: true },
    isBaseline: { type: Boolean, required: true },
    suitabilityScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    criterionScores: {
      soilHealth: { type: Number, default: null },
      waterConservation: { type: Number, default: null },
      climateResilience: { type: Number, default: null },
      economicSuitability: { type: Number, default: null },
      erosionReduction: { type: Number, default: null },
    },
    expectedYieldIndexPct: { type: Number, required: true },
    soilHealthRating: { type: String, required: true },
    riskLevel: { type: String, required: true },
    badgeLabel: { type: String, required: true },
    benefits: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    evidence: { type: [String], default: [] },
    missingInfo: { type: [String], default: [] },
    uncertaintyNote: { type: String, required: true },
  },
  { _id: false }
);

const analysisSchema = new Schema<AnalysisRecord>(
  {
    id: { type: String, required: true, unique: true, index: true },
    farmId: { type: String, required: true, index: true },
    createdByUserId: { type: String, required: true },
    methodologyVersion: { type: String, required: true },
    priorities: {
      soilHealth: { type: Number, required: true },
      waterConservation: { type: Number, required: true },
      climateResilience: { type: Number, required: true },
      economicSuitability: { type: Number, required: true },
      erosionReduction: { type: Number, required: true },
    },
    climateObservationId: { type: String, required: true },
    soilProfileId: { type: String, required: true },
    overallFarmHealthScore: { type: Number, required: true },
    strategies: { type: [strategyEvaluationSchema], default: [] },
    recommendedStrategyId: { type: String, required: true },
    keyInsights: { type: [String], default: [] },
    recommendedActions: { type: [String], default: [] },
    dataLimitations: { type: [String], default: [] },
    createdAt: { type: String, required: true, index: true },
  },
  { ...schemaOptions, collection: 'analyses' }
);

const reviewSchema = new Schema<ExtensionReview>(
  {
    id: { type: String, required: true, unique: true, index: true },
    analysisId: { type: String, required: true, index: true },
    farmId: { type: String, required: true, index: true },
    reviewerId: { type: String, required: true },
    reviewerName: { type: String, required: true },
    reviewerRole: { type: String, required: true },
    status: {
      type: String,
      enum: ['Reviewed - Endorsed', 'Needs Field Verification', 'Missing Soil Data Flagged'],
      required: true,
    },
    comments: { type: String, required: true },
    flaggedRisks: { type: [String], default: [] },
    missingInfoIdentified: { type: [String], default: [] },
    createdAt: { type: String, required: true },
  },
  { ...schemaOptions, collection: 'reviews' }
);

const contactMessageSchema = new Schema<ContactMessage>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { ...schemaOptions, collection: 'contact_messages' }
);

export const UserModel = mongoose.models.User || mongoose.model<User>('User', userSchema);
export const FarmModel = mongoose.models.Farm || mongoose.model<Farm>('Farm', farmSchema);
export const SoilProfileModel =
  mongoose.models.SoilProfile || mongoose.model<SoilProfile>('SoilProfile', soilProfileSchema);
export const CropModel = mongoose.models.Crop || mongoose.model<CropProfile>('Crop', cropSchema);
export const ClimateObservationModel =
  mongoose.models.ClimateObservation ||
  mongoose.model<ClimateObservationRecord>('ClimateObservation', climateObservationSchema);
export const RotationPlanModel =
  mongoose.models.RotationPlan || mongoose.model<RotationPlan>('RotationPlan', rotationPlanSchema);
export const AnalysisModel =
  mongoose.models.Analysis || mongoose.model<AnalysisRecord>('Analysis', analysisSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model<ExtensionReview>('Review', reviewSchema);
export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model<ContactMessage>('ContactMessage', contactMessageSchema);
