export type UserRole = 'farmer' | 'extension_officer' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  state: string;
  lga?: string;
  city?: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
}

export interface CoordinatePoint {
  lat: number;
  lng: number;
}

export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  state: string;
  lga: string;
  city?: string;
  latitude: number;
  longitude: number;
  boundary?: CoordinatePoint[];
  sizeHectares: number;
  soilType: string;
  waterSource: string;
  currentCrop: string;
  previousCrops: string[];
  farmingPractice: string;
  lastPlantingDate?: string | null;
  expectedHarvestDate?: string | null;
  isPilotDemo?: boolean;
  status: 'Active' | 'Planning' | 'Fallow';
  updatedAt: string;
  createdAt: string;
}

export type SoilSourceType = 'laboratory_test' | 'farmer_reported' | 'untested';

export interface SoilProfile {
  id: string;
  farmId: string;
  source: SoilSourceType;
  labName?: string | null;
  samplingDate?: string | null;
  soilTexture: string;
  // Store missing soil values explicitly as null, never zero
  ph: number | null;
  organicMatterPercent: number | null;
  nitrogenMgKg: number | null;
  phosphorusMgKg: number | null;
  potassiumMgKg: number | null;
  drainageClass: 'Well-drained' | 'Moderately drained' | 'Poorly drained' | 'Unknown';
  notes: string;
  missingFields: string[];
  updatedAt: string;
}

export interface CropProfile {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  summary: string;
  durationDaysMin: number;
  durationDaysMax: number;
  oyoPlantingWindows: {
    earlySeason: string;
    lateSeason: string;
    harvestWindow: string;
  };
  waterRequirementMmMin: number;
  waterRequirementMmMax: number;
  tempOptimalMinC: number;
  tempOptimalMaxC: number;
  heatStressThresholdC: number;
  phMin: number;
  phMax: number;
  keyNutrients: string[];
  rootCharacteristics: string;
  nitrogenFixingPotential: {
    capable: boolean;
    estimateKgHa: string;
    managementCaveat: string;
  };
  soilHealthContributions: string[];
  managementRequirements: string[];
  pestAndDiseaseRisks: string[];
  growingTips: string[];
  yieldPotentialTonHa: number;
  references: Array<{
    source: string;
    title: string;
    context: string;
  }>;
}

export interface DailyClimateObservation {
  date: string;
  rainfallMm: number | null;
  tempMeanC: number | null;
  tempMaxC: number | null;
  tempMinC: number | null;
  relativeHumidityPct: number | null;
  solarRadiationMjM2: number | null;
  surfaceSoilWetnessPct: number | null;
  rootZoneSoilWetnessPct: number | null;
}

export interface DatasetProvenance {
  datasetName: string;
  role: string;
  measurementType: 'Satellite-derived & Reanalysis Model' | 'Multi-Satellite Observation' | 'L-Band Radiometer Satellite';
  spatialResolution: string;
  temporalResolution: string;
  parameters: string[];
  units: Record<string, string>;
  retrievalDate: string;
  archiveWindowUsed: string;
  qualityFlag: 'Verified Live NASA API' | 'Cached NASA Observation' | 'Regional Reference Supplement';
  limitations: string;
}

export interface ClimateObservationRecord {
  id: string;
  farmId: string;
  latitude: number;
  longitude: number;
  rangeDays: number;
  fetchedAt: string;
  isLiveNasaFetch: boolean;
  observations: DailyClimateObservation[];
  summary: {
    totalRainfallMm: number;
    avgDailyRainfallMm: number;
    avgTempC: number;
    maxTempC: number;
    minTempC: number;
    avgHumidityPct: number;
    avgSoilMoisturePct: number;
    avgRootZoneMoisturePct: number;
    heatStressDays: number;
    drySpellDays: number;
    moistureStatus: 'Optimal' | 'Moderate' | 'Low' | 'Excess';
    rainfallTrendPct: number | null;
    tempTrendDeltaC: number | null;
  };
  provenance: DatasetProvenance[];
}

export interface RotationPlan {
  id: string;
  farmId: string;
  code: string;
  label: string;
  category: 'Baseline' | 'Balanced' | 'Legume-First' | 'Maize-Focus' | 'Custom';
  sequence: string[]; // e.g., ['Maize', 'Cowpea', 'Maize']
  isBaseline: boolean;
  createdAt: string;
}

export interface FarmerPriorities {
  soilHealth: number; // 0-100
  waterConservation: number; // 0-100
  climateResilience: number; // 0-100
  economicSuitability: number; // 0-100
  erosionReduction: number; // 0-100
}

export interface StrategyEvaluation {
  rotationPlanId: string;
  code: string;
  label: string;
  sequence: string[];
  isBaseline: boolean;
  suitabilityScore: number; // 0-100 weighted S_j = Σ(w_i * s_ij) / Σw_i
  confidenceScore: number; // 0-100 evidence completeness & reliability
  criterionScores: {
    soilHealth: number | null;
    waterConservation: number | null;
    climateResilience: number | null;
    economicSuitability: number | null;
    erosionReduction: number | null;
  };
  expectedYieldIndexPct: number;
  soilHealthRating: 'Excellent' | 'Very Good' | 'Good' | 'Declining Risk';
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  badgeLabel: 'Recommended' | 'Good Fit' | 'High Potential' | 'Baseline Practice';
  benefits: string[];
  risks: string[];
  evidence: string[];
  missingInfo: string[];
  uncertaintyNote: string;
}

export interface AnalysisRecord {
  id: string;
  farmId: string;
  createdByUserId: string;
  methodologyVersion: string;
  priorities: FarmerPriorities;
  climateObservationId: string;
  soilProfileId: string;
  overallFarmHealthScore: number;
  strategies: StrategyEvaluation[];
  recommendedStrategyId: string;
  keyInsights: string[];
  recommendedActions: string[];
  dataLimitations: string[];
  createdAt: string;
}

export interface ExtensionReview {
  id: string;
  analysisId: string;
  farmId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  status: 'Reviewed - Endorsed' | 'Needs Field Verification' | 'Missing Soil Data Flagged';
  comments: string;
  flaggedRisks: string[];
  missingInfoIdentified: string[];
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface AgroLensDatabase {
  users: User[];
  farms: Farm[];
  soilProfiles: SoilProfile[];
  crops: CropProfile[];
  climateObservations: ClimateObservationRecord[];
  rotationPlans: RotationPlan[];
  analyses: AnalysisRecord[];
  reviews: ExtensionReview[];
  contactMessages: ContactMessage[];
}
