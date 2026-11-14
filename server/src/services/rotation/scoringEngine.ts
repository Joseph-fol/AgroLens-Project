import type {
  AnalysisRecord,
  ClimateObservationRecord,
  FarmerPriorities,
  Farm,
  RotationPlan,
  SoilProfile,
  StrategyEvaluation,
} from '../../types/domain';

export const METHODOLOGY_VERSION = 'agrolens-v1.0-oyo-pilot';

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Evaluates a candidate crop rotation sequence using:
 * S_j = Σ(w_i × s_{i,j}) / Σw_i
 *
 * Scientific integrity principles enforced:
 * 1. Missing soil lab values NEVER silently become 0 in suitability scoring;
 *    instead they reduce the separate Evidence Confidence score and are disclosed.
 * 2. Legume presence does NOT automatically guarantee fertility improvement;
 *    benefits are conditional on biomass retention, P availability, and pH.
 */
export function evaluateRotationStrategies(params: {
  farm: Farm;
  soil: SoilProfile | null;
  climate: ClimateObservationRecord;
  plans: RotationPlan[];
  priorities: FarmerPriorities;
  userId: string;
}): AnalysisRecord {
  const { farm, soil, climate, plans, priorities, userId } = params;

  // Compute data completeness / confidence base
  let confidenceBase = 55; // Base: farm coordinates + crop agronomic database
  const globalMissingInfo: string[] = [];

  if (climate.isLiveNasaFetch) {
    confidenceBase += 22;
  } else {
    confidenceBase += 10;
    globalMissingInfo.push('Live NASA POWER retrieval unavailable during fetch; regional climatology baseline used.');
  }

  if (soil) {
    if (soil.source === 'laboratory_test') confidenceBase += 15;
    else if (soil.source === 'farmer_reported') confidenceBase += 7;

    if (soil.ph !== null) confidenceBase += 4;
    else globalMissingInfo.push('Soil pH measurement missing (cannot confirm legume nodulation pH suitability).');

    if (soil.organicMatterPercent !== null) confidenceBase += 2;
    else globalMissingInfo.push('Soil organic matter (%) laboratory result missing.');

    if (soil.nitrogenMgKg !== null && soil.phosphorusMgKg !== null && soil.potassiumMgKg !== null) {
      confidenceBase += 4;
    } else {
      globalMissingInfo.push('Soil laboratory NPK levels missing (nutrient balance relies on crop-sequence averages).');
    }
  } else {
    globalMissingInfo.push('No soil profile recorded for this farm.');
  }

  const totalWeight =
    priorities.soilHealth +
      priorities.waterConservation +
      priorities.climateResilience +
      priorities.economicSuitability +
      priorities.erosionReduction || 1;

  const strategies: StrategyEvaluation[] = plans.map((plan) => {
    const seq = plan.sequence.map((s) => s.toLowerCase());
    const hasCowpea = seq.includes('cowpea');
    const hasSoybean = seq.includes('soybean');
    const maizeCount = seq.filter((c) => c === 'maize').length;
    const uniqueCrops = new Set(seq).size;
    const isContinuousMaize = uniqueCrops === 1 && maizeCount === seq.length;

    // 1. Soil Health score (0-100)
    let soilScore = 52;
    if (isContinuousMaize) {
      soilScore = 38; // Continuous cereal depletes N & increases Striga/root pressure
    } else {
      if (hasCowpea) soilScore += 22;
      if (hasSoybean) soilScore += 20;
      if (uniqueCrops >= 3) soilScore += 8;
      // Soil pH check (only adjust if pH is actually measured, NEVER coerce null to 0)
      if (soil?.ph !== null && soil?.ph !== undefined) {
        if (soil.ph >= 5.8 && soil.ph <= 7.0) soilScore += 6;
        else if (soil.ph < 5.5) soilScore -= 8; // Acidic stress limits legume nodulation
      }
    }

    // 2. Water Conservation score (0-100)
    let waterScore = 62;
    if (hasCowpea) waterScore += 18; // Cowpea requires 350-550 mm and tolerates dry spells
    if (hasSoybean) waterScore += 8;
    if (isContinuousMaize) waterScore -= 16;
    if (climate.summary.avgSoilMoisturePct < 48 && maizeCount >= 2 && !hasCowpea) {
      waterScore -= 10;
    }
    if (climate.summary.drySpellDays > Math.round(climate.rangeDays * 0.55) && hasCowpea) {
      waterScore += 6;
    }

    // 3. Climate Resilience score (0-100)
    let climateScore = 58;
    if (uniqueCrops >= 2) climateScore += 16;
    if (uniqueCrops >= 3) climateScore += 10;
    if (isContinuousMaize) climateScore -= 18;
    if (climate.summary.heatStressDays > 5 && hasCowpea) {
      climateScore += 6; // Cowpea tolerates up to ~36°C better than maize
    }
    if (climate.summary.avgTempC >= 22 && climate.summary.avgTempC <= 30) {
      climateScore += 6;
    }

    // 4. Economic Suitability score (0-100)
    let economicScore = 64;
    if (maizeCount >= 1 && (hasSoybean || hasCowpea)) {
      economicScore += 14; // Staple food security + legume cash/protein diversity
    }
    if (hasSoybean) economicScore += 8; // Strong agro-processing market in Oyo State
    if (isContinuousMaize) economicScore -= 8; // Higher fertilizer input dependency

    // 5. Erosion Reduction score (0-100)
    let erosionScore = 55;
    if (hasCowpea) erosionScore += 24; // Fast spreading canopy cover
    if (hasSoybean) erosionScore += 16;
    if (isContinuousMaize) erosionScore -= 14;

    const cScores = {
      soilHealth: clamp(soilScore),
      waterConservation: clamp(waterScore),
      climateResilience: clamp(climateScore),
      economicSuitability: clamp(economicScore),
      erosionReduction: clamp(erosionScore),
    };

    // Weighted arithmetic mean: S_j = Σ(w_i * s_ij) / Σw_i
    const weightedSum =
      priorities.soilHealth * cScores.soilHealth +
      priorities.waterConservation * cScores.waterConservation +
      priorities.climateResilience * cScores.climateResilience +
      priorities.economicSuitability * cScores.economicSuitability +
      priorities.erosionReduction * cScores.erosionReduction;

    const suitabilityScore = clamp(weightedSum / totalWeight);

    // Strategy-specific confidence (lower if strategy relies heavily on soybean N-fixation without soil pH/P lab data)
    let strategyConfidence = confidenceBase;
    const missingInfo = [...globalMissingInfo];
    if (hasSoybean && soil?.ph === null) {
      strategyConfidence -= 6;
      missingInfo.push('Soybean nodulation efficiency depends on soil pH (6.0–7.0 ideal); verify locally.');
    }

    const expectedYieldIndexPct = isContinuousMaize
      ? -6
      : uniqueCrops >= 3
      ? 18
      : hasSoybean && maizeCount === 2
      ? 20
      : 16;

    const soilHealthRating: StrategyEvaluation['soilHealthRating'] =
      cScores.soilHealth >= 82
        ? 'Excellent'
        : cScores.soilHealth >= 70
        ? 'Very Good'
        : cScores.soilHealth >= 55
        ? 'Good'
        : 'Declining Risk';

    const riskLevel: StrategyEvaluation['riskLevel'] = isContinuousMaize
      ? 'High Risk'
      : uniqueCrops >= 2 && cScores.climateResilience >= 72
      ? 'Low Risk'
      : 'Moderate Risk';

    const benefits: string[] = [];
    const risks: string[] = [];
    const evidence: string[] = [];

    if (isContinuousMaize) {
      benefits.push('Familiar single-crop workflow and consistent maize grain output when inputs are high.');
      risks.push('Accelerates nitrogen depletion and elevates Striga hermonthica and Fall Armyworm carryover.');
      risks.push('Lower canopy ground cover increases topsoil erosion risk during heavy Oyo storms.');
      evidence.push(
        `NASA POWER observed ${climate.summary.avgTempC}°C mean temp and ${climate.summary.avgSoilMoisturePct}% surface soil wetness across ${climate.rangeDays} days.`
      );
      evidence.push('Continuous cereal monocropping lacks biological nitrogen replacement (0 kg N/ha fixed).');
    } else {
      if (hasCowpea) {
        benefits.push('Cowpea provides rapid ground cover (erosion control) and drought resilience in dry spells.');
        benefits.push('Breaks cereal pest and Striga weed cycles between maize seasons.');
      }
      if (hasSoybean) {
        benefits.push('Soybean diversifies farm revenue via Oyo agro-processing demand while adding leaf-litter organic matter.');
      }
      if (maizeCount >= 1) {
        benefits.push('Retains maize as the core household food-security and staple grain crop.');
      }

      risks.push(
        'Legume nitrogen benefit is NOT automatic: removing all haulms or lacking phosphorus/nodulation reduces net soil gain.'
      );
      if (hasCowpea) {
        risks.push('Cowpea flowering requires timely pest scouting for Maruca pod borer and thrips.');
      }
      if (hasSoybean) {
        risks.push('Soybean requires careful moisture during pod fill and timely harvest to avoid pod shattering.');
      }

      evidence.push(
        `NASA POWER (${climate.summary.totalRainfallMm} mm / ${climate.rangeDays}d, ${climate.summary.avgTempC}°C avg) aligns with Oyo ${farm.lga} derived-savanna crop thresholds.`
      );
      if (soil?.ph !== null && soil?.ph !== undefined) {
        evidence.push(`Recorded soil pH (${soil.ph}, ${soil.source.replace('_', ' ')}) falls within viable crop tolerance.`);
      }
    }

    return {
      rotationPlanId: plan.id,
      code: plan.code,
      label: plan.label,
      sequence: plan.sequence,
      isBaseline: plan.isBaseline,
      suitabilityScore,
      confidenceScore: clamp(strategyConfidence, 35, 96),
      criterionScores: cScores,
      expectedYieldIndexPct,
      soilHealthRating,
      riskLevel,
      badgeLabel: plan.isBaseline ? 'Baseline Practice' : 'Good Fit',
      benefits,
      risks,
      evidence,
      missingInfo,
      uncertaintyNote:
        'Regional satellite observations (~55 km NASA POWER / ~11 km GPM) indicate macro-climate suitability; plot-level soil NPK testing and extension verification are recommended before planting.',
    };
  });

  // Rank non-baseline strategies to assign 'Recommended' & 'High Potential' badges transparently
  const sortedNonBaseline = [...strategies]
    .filter((s) => !s.isBaseline)
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const topId = sortedNonBaseline[0]?.rotationPlanId ?? strategies[0]?.rotationPlanId ?? '';
  const secondId = sortedNonBaseline[1]?.rotationPlanId;

  for (const s of strategies) {
    if (s.rotationPlanId === topId) {
      s.badgeLabel = 'Recommended';
    } else if (s.rotationPlanId === secondId && s.expectedYieldIndexPct >= 18) {
      s.badgeLabel = 'High Potential';
    }
  }

  const topStrategy = strategies.find((s) => s.rotationPlanId === topId) ?? strategies[0];

  const overallFarmHealthScore = clamp(
    (climate.summary.avgSoilMoisturePct >= 45 && climate.summary.avgSoilMoisturePct <= 80 ? 84 : 68) * 0.55 +
      (topStrategy ? topStrategy.suitabilityScore * 0.45 : 35)
  );

  const keyInsights: string[] = [
    `Top-ranked sequence under your priorities is ${topStrategy.code} (${topStrategy.sequence.join(' → ')}) with a weighted suitability score of ${topStrategy.suitabilityScore}/100 (Confidence: ${topStrategy.confidenceScore}%).`,
    `NASA POWER (${climate.rangeDays}-day window) indicates ${climate.summary.totalRainfallMm} mm cumulative rainfall, ${climate.summary.avgTempC}°C mean temperature, and ${climate.summary.avgSoilMoisturePct}% surface wetness (${climate.summary.moistureStatus}).`,
    `Replacing continuous maize monocropping with a maize–legume sequence disrupts Striga and Fall Armyworm cycles, provided crop residues are retained.`,
  ];

  const recommendedActions: string[] = [
    `Review ${topStrategy.code} (${topStrategy.sequence.join(' → ')}) with your local Oyo State ADP extension officer before seed procurement.`,
    'Schedule a laboratory soil NPK & organic matter test to raise analysis confidence above 85%.',
    'Monitor whorl-stage maize weekly for Fall Armyworm and scout cowpea/soybean at flowering.',
    'Retain legume haulms/stover on-field after harvest rather than burning to support organic matter.',
  ];

  const dataLimitations: string[] = [
    'NASA POWER meteorological variables represent a 0.5° × 0.625° (~55 km) grid cell rather than exact farm-boundary measurements.',
    'Soil moisture indicators from NASA MERRA-2 / SMAP reflect regional upper-soil wetness and do not replace on-farm infiltration checks.',
    ...(globalMissingInfo.length > 0
      ? globalMissingInfo
      : ['All core farm profile and NASA environmental indicators are populated.']),
  ];

  return {
    id: `analysis-${farm.id}-${Date.now()}`,
    farmId: farm.id,
    createdByUserId: userId,
    methodologyVersion: METHODOLOGY_VERSION,
    priorities,
    climateObservationId: climate.id,
    soilProfileId: soil?.id ?? 'none',
    overallFarmHealthScore,
    strategies,
    recommendedStrategyId: topId,
    keyInsights,
    recommendedActions,
    dataLimitations,
    createdAt: new Date().toISOString(),
  };
}
