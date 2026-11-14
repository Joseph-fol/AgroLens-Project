import bcrypt from 'bcryptjs';
import {
  AnalysisModel,
  ClimateObservationModel,
  CropModel,
  FarmModel,
  ReviewModel,
  RotationPlanModel,
  SoilProfileModel,
  UserModel,
} from '../models/schemas';
import { fetchNasaPowerForCoordinates } from '../services/nasa/nasaPowerService';
import { evaluateRotationStrategies } from '../services/rotation/scoringEngine';
import type { CropProfile, Farm, RotationPlan, SoilProfile, User } from '../types/domain';

export const CROP_CATALOG_SEED: CropProfile[] = [
  {
    id: 'maize',
    name: 'Maize',
    scientificName: 'Zea mays L.',
    family: 'Poaceae',
    summary:
      'High-yielding cereal staple critical for food security and farm income in Oyo State; sensitive to prolonged dry spells during tasseling and silking.',
    durationDaysMin: 95,
    durationDaysMax: 120,
    oyoPlantingWindows: {
      earlySeason: 'March – April (after steady onset of rains)',
      lateSeason: 'August – early September (early-maturing varieties)',
      harvestWindow: 'July – August (early) / November – December (late)',
    },
    waterRequirementMmMin: 500,
    waterRequirementMmMax: 800,
    tempOptimalMinC: 20,
    tempOptimalMaxC: 30,
    heatStressThresholdC: 34,
    phMin: 5.5,
    phMax: 7.0,
    keyNutrients: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
    rootCharacteristics:
      'Fibrous shallow-to-medium root system concentrated in top 30–60 cm; high nutrient uptake demand, especially nitrogen.',
    nitrogenFixingPotential: {
      capable: false,
      estimateKgHa: '0 kg N/ha (net nitrogen consumer)',
      managementCaveat:
        'Requires external nitrogen replenishment via legume rotation residue, compost, or targeted mineral fertilizer.',
    },
    soilHealthContributions: [
      'Produces substantial stover biomass that can reduce surface runoff if retained as mulch rather than burned.',
      'Deepening root channels moderately improve topsoil aeration when intercropped or rotated.',
    ],
    managementRequirements: [
      'Timely weeding within the first 3–6 weeks after emergence to avoid severe yield loss.',
      'Split nitrogen application or preceding legume residue retention depending on soil test status.',
      'Ensure well-drained seedbeds to prevent waterlogging during peak Oyo rainy months.',
    ],
    pestAndDiseaseRisks: [
      'Fall Armyworm (Spodoptera frugiperda) whorl feeding during vegetative stages.',
      'Striga hermonthica parasitic weed pressure under continuous cereal monocropping.',
      'Maize Streak Virus (MSV) transmitted by Cicadulina leafhoppers.',
    ],
    growingTips: [
      'Plant at onset of steady rains (avoid dry-planting before reliable moisture).',
      'Use improved drought-tolerant and Striga-resistant Oyo-adapted varieties (e.g., SAMMAZ / IITA lines).',
      'Avoid continuous maize-after-maize where soil N and Striga pressure are unmanaged.',
    ],
    yieldPotentialTonHa: 2.8,
    references: [
      {
        source: 'IITA (International Institute of Tropical Agriculture)',
        title: 'Maize Production Guide for West Africa & Derived Savanna Zones',
        context: 'Ibadan / Oyo State agronomic standards & spacing',
      },
      {
        source: 'NiMet (Nigerian Meteorological Agency)',
        title: 'Seasonal Climate Prediction & Onset/Cessation Windows for Oyo State',
        context: 'Planting window alignment',
      },
      {
        source: 'FAO Crop Water Information',
        title: 'Maize evapotranspiration and heat-stress thresholds',
        context: 'Water demand & thermal tolerances',
      },
    ],
  },
  {
    id: 'cowpea',
    name: 'Cowpea',
    scientificName: 'Vigna unguiculata (L.) Walp.',
    family: 'Fabaceae',
    summary:
      'Drought-tolerant grain legume valued for protein nutrition, rapid ground cover, and potential biological nitrogen fixation when properly managed.',
    durationDaysMin: 60,
    durationDaysMax: 85,
    oyoPlantingWindows: {
      earlySeason: 'April – May (relay or sole crop)',
      lateSeason: 'August – mid-September (preferred in Oyo to harvest in dry weather)',
      harvestWindow: 'July (early) / October – November (late)',
    },
    waterRequirementMmMin: 350,
    waterRequirementMmMax: 550,
    tempOptimalMinC: 22,
    tempOptimalMaxC: 33,
    heatStressThresholdC: 36,
    phMin: 5.5,
    phMax: 7.2,
    keyNutrients: ['Phosphorus (P)', 'Potassium (K)', 'Sulfur (S)'],
    rootCharacteristics:
      'Deep taproot capable of reaching 100+ cm; supports drought resilience and forms root nodules with Bradyrhizobium bacteria.',
    nitrogenFixingPotential: {
      capable: true,
      estimateKgHa: '25–65 kg N/ha net contribution (variable)',
      managementCaveat:
        'Introducing a legume does not automatically guarantee improved soil fertility or higher yields. Net N benefit depends on retaining crop haulms/biomass, adequate soil phosphorus, effective nodulation, and local soil pH.',
    },
    soilHealthContributions: [
      'Rapid canopy closure suppresses weeds and reduces raindrop impact erosion.',
      'Breaks cereal pest and Striga life cycles when rotated after maize.',
    ],
    managementRequirements: [
      'Avoid waterlogged soils; cowpea is susceptible to root rot in standing water.',
      'Monitor flowering and podding closely for insect pests.',
      'Retain haulms or incorporate residues post-harvest to preserve organic matter.',
    ],
    pestAndDiseaseRisks: [
      'Maruca vitrata (pod borer) and flower thrips during reproductive stages.',
      'Aphids (Aphis craccivora) and pod-sucking bugs.',
      'Cowpea bruchid (Callosobruchus maculatus) during post-harvest storage.',
    ],
    growingTips: [
      'Late-season planting in Oyo helps pods mature as rains taper off, reducing fungal rot.',
      'Moderate phosphorus availability supports stronger root nodulation.',
      'Rotate with maize to disrupt Fall Armyworm and Striga buildup.',
    ],
    yieldPotentialTonHa: 1.6,
    references: [
      {
        source: 'IITA Cowpea Program (Ibadan)',
        title: 'Improved Cowpea Varieties & Integrated Pest Management in Southwest Nigeria',
        context: 'Oyo State relay & late-season systems',
      },
      {
        source: 'FAO Legume Agronomy Brief',
        title: 'Biological Nitrogen Fixation Limits in Smallholder Cereal-Legume Rotations',
        context: 'Biomass retention & phosphorus caveats',
      },
    ],
  },
  {
    id: 'soybean',
    name: 'Soybean',
    scientificName: 'Glycine max (L.) Merr.',
    family: 'Fabaceae',
    summary:
      'High-value commercial and soil-building legume suitable for Oyo State derived-savanna zones, requiring adequate moisture during pod fill.',
    durationDaysMin: 90,
    durationDaysMax: 120,
    oyoPlantingWindows: {
      earlySeason: 'Late May – June',
      lateSeason: 'Mid-July – early August (depending on variety maturity)',
      harvestWindow: 'October – November',
    },
    waterRequirementMmMin: 450,
    waterRequirementMmMax: 700,
    tempOptimalMinC: 20,
    tempOptimalMaxC: 30,
    heatStressThresholdC: 34,
    phMin: 6.0,
    phMax: 7.0,
    keyNutrients: ['Phosphorus (P)', 'Potassium (K)', 'Calcium (Ca)', 'Molybdenum (Mo)'],
    rootCharacteristics:
      'Moderately deep taproot with lateral roots in top 45 cm; forms nitrogen-fixing nodules with compatible Bradyrhizobium japonicum strains.',
    nitrogenFixingPotential: {
      capable: true,
      estimateKgHa: '30–80 kg N/ha fixed (subject to harvest removal)',
      managementCaveat:
        'Grain harvest removes substantial nitrogen; soil fertility gains occur mainly when residues remain on-field and promiscuous varieties or rhizobium inoculants are paired with sufficient phosphorus and near-neutral soil pH.',
    },
    soilHealthContributions: [
      'Dense leaf litter drop at maturity enriches topsoil organic matter.',
      'Disrupts maize pest cycles and suppresses Striga germination via trap-cropping effect.',
    ],
    managementRequirements: [
      'Use promiscuous-nodulating Nigerian varieties (e.g., TGx lines) or apply approved inoculant.',
      'Soil pH below 5.5 can limit nodulation; verify pH via laboratory testing before scaling.',
      'Harvest promptly at physiological maturity to avoid pod shattering.',
    ],
    pestAndDiseaseRisks: [
      'Asian soybean rust (Phakopsora pachyrhizi) during humid periods.',
      'Pod-sucking bugs and defoliating caterpillars.',
      'Rapid seed viability loss if stored in humid conditions.',
    ],
    growingTips: [
      'Plant when topsoil moisture is reliable to ensure uniform germination.',
      'Avoid acidic soils without liming or organic amendment.',
      'Strong commercial off-take market in Oyo agro-processing corridors.',
    ],
    yieldPotentialTonHa: 2.0,
    references: [
      {
        source: 'IITA & NCRI Nigeria',
        title: 'Promiscuous Soybean (TGx) Cultivation in Derived Savanna & Forest Transition Zones',
        context: 'Oyo State inoculation & pod-shattering management',
      },
      {
        source: 'Federal Ministry of Agriculture / NIHORT',
        title: 'Soybean-Maize Rotation Soil Nutrient Balance Studies',
        context: 'Nutrient removal vs residue retention',
      },
    ],
  },
];

export async function seedMongoDatabase(): Promise<void> {
  const now = new Date().toISOString();

  // Always upsert curated crop catalog so agronomic profiles stay up-to-date in MongoDB
  for (const crop of CROP_CATALOG_SEED) {
    await CropModel.updateOne({ id: crop.id }, { $set: crop }, { upsert: true });
  }

  const userCount = await UserModel.countDocuments();
  if (userCount === 0) {
    const demoPasswordHash = await bcrypt.hash('agrolens2026', 10);
    const seedUsers: User[] = [
      {
        id: 'user-farmer-joseph',
        fullName: 'Olawale Joseph',
        email: 'joseph@agrolens.ng',
        phone: '+234 801 234 5678',
        state: 'Oyo State',
        lga: 'Oyo East',
        role: 'farmer',
        passwordHash: demoPasswordHash,
        createdAt: now,
      },
      {
        id: 'user-extension-adebayo',
        fullName: 'Dr. Adebayo Adeyemi',
        email: 'extension@agrolens.ng',
        phone: '+234 803 456 7890',
        state: 'Oyo State',
        lga: 'Akinyele',
        role: 'extension_officer',
        passwordHash: demoPasswordHash,
        createdAt: now,
      },
    ];
    await UserModel.insertMany(seedUsers);
  }

  const farmCount = await FarmModel.countDocuments();
  if (farmCount === 0) {
    const pilotFarm: Farm = {
      id: 'farm-oyo-pilot-1',
      ownerId: 'user-farmer-joseph',
      name: 'Oyo Pilot Farm (Akinyele)',
      state: 'Oyo State',
      lga: 'Akinyele',
      city: 'Moniya',
      latitude: 7.5308,
      longitude: 3.9125,
      boundary: [
        { lat: 7.5322, lng: 3.9108 },
        { lat: 7.5324, lng: 3.9142 },
        { lat: 7.5295, lng: 3.9146 },
        { lat: 7.5292, lng: 3.911 },
      ],
      sizeHectares: 2.5,
      soilType: 'Loamy Soil (Sandy Loam)',
      waterSource: 'Rainfed (Seasonal)',
      currentCrop: 'Maize',
      previousCrops: ['Maize', 'Cowpea'],
      farmingPractice: 'Mixed Rainfed Smallholder',
      lastPlantingDate: '2025-04-18',
      expectedHarvestDate: '2025-08-10',
      isPilotDemo: true,
      status: 'Active',
      updatedAt: now,
      createdAt: now,
    };
    await FarmModel.create(pilotFarm);

    const pilotSoil: SoilProfile = {
      id: 'soil-oyo-pilot-1',
      farmId: pilotFarm.id,
      source: 'farmer_reported',
      labName: null,
      samplingDate: '2025-03-28',
      soilTexture: 'Sandy Loam',
      ph: 6.2,
      organicMatterPercent: null,
      nitrogenMgKg: null,
      phosphorusMgKg: null,
      potassiumMgKg: null,
      drainageClass: 'Well-drained',
      notes:
        'Farmer-reported soil pH test strip reading (6.2) and field texture assessment. Laboratory NPK and organic carbon test pending with IITA / Oyo State ADP.',
      missingFields: ['organicMatterPercent', 'nitrogenMgKg', 'phosphorusMgKg', 'potassiumMgKg'],
      updatedAt: now,
    };
    await SoilProfileModel.create(pilotSoil);

    const rotationPlans: RotationPlan[] = [
      {
        id: 'rot-baseline-a',
        farmId: pilotFarm.id,
        code: 'Strategy A',
        label: 'Existing Practice (Continuous Maize)',
        category: 'Baseline',
        sequence: ['Maize', 'Maize', 'Maize'],
        isBaseline: true,
        createdAt: now,
      },
      {
        id: 'rot-cowpea-b',
        farmId: pilotFarm.id,
        code: 'Strategy B',
        label: 'Balanced Legume Rotation',
        category: 'Balanced',
        sequence: ['Maize', 'Cowpea', 'Maize'],
        isBaseline: false,
        createdAt: now,
      },
      {
        id: 'rot-soybean-c',
        farmId: pilotFarm.id,
        code: 'Strategy C',
        label: 'Commercial Legume Rotation',
        category: 'Maize-Focus',
        sequence: ['Maize', 'Soybean', 'Maize'],
        isBaseline: false,
        createdAt: now,
      },
      {
        id: 'rot-diversified-d',
        farmId: pilotFarm.id,
        code: 'Strategy D',
        label: 'Three-Crop Diversified',
        category: 'Legume-First',
        sequence: ['Maize', 'Cowpea', 'Soybean'],
        isBaseline: false,
        createdAt: now,
      },
    ];
    await RotationPlanModel.insertMany(rotationPlans);

    // Seed initial live NASA POWER climate observation & initial analysis + review into MongoDB
    const climate = await fetchNasaPowerForCoordinates(pilotFarm.id, pilotFarm.latitude, pilotFarm.longitude, 7);
    await ClimateObservationModel.create(climate);

    const initialAnalysis = evaluateRotationStrategies({
      farm: pilotFarm,
      soil: pilotSoil,
      climate,
      plans: rotationPlans,
      priorities: {
        soilHealth: 35,
        waterConservation: 25,
        climateResilience: 15,
        economicSuitability: 15,
        erosionReduction: 10,
      },
      userId: 'user-farmer-joseph',
    });
    await AnalysisModel.create(initialAnalysis);

    await ReviewModel.create({
      id: 'rev-oyo-pilot-initial',
      analysisId: initialAnalysis.id,
      farmId: pilotFarm.id,
      reviewerId: 'user-extension-adebayo',
      reviewerName: 'Dr. Adebayo Adeyemi',
      reviewerRole: 'Agricultural Extension Officer',
      status: 'Missing Soil Data Flagged',
      comments:
        'Preliminary Maize-Cowpea-Maize rotation aligns well with Akinyele late-season rains. Before finalizing fertilizer rates, submit a composite 0-20 cm soil sample for lab Phosphorus and Organic Matter verification.',
      flaggedRisks: ['Fall Armyworm early whorl pressure', 'Unverified soil Phosphorus'],
      missingInfoIdentified: ['Laboratory Soil NPK', 'Organic Matter %'],
      createdAt: now,
    });
  }
}
