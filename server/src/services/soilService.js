const interpretSoilMetrics = (data) => {
  const { ph, nitrogen, phosphorus, potassium, moisture = 25, organicMatter = 1.5 } = data;

  const recommendations = [];

  // 1. pH Interpretation
  let phStatus = 'Optimal / Neutral';
  if (ph < 5.5) {
    phStatus = 'Acidic';
    recommendations.push({
      parameter: 'Soil pH',
      issue: 'Strongly Acidic (pH < 5.5)',
      suggestion: 'Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH and relieve aluminum toxicity. Incorporate thoroughly 4-6 weeks before planting.',
      actionType: 'Amendment',
    });
  } else if (ph < 6.5) {
    phStatus = 'Slightly Acidic';
    recommendations.push({
      parameter: 'Soil pH',
      issue: 'Mildly Acidic (pH 5.5 - 6.5)',
      suggestion: 'Suitable for most cereals and pulses. Add organic compost to naturally buffer soil pH.',
      actionType: 'Monitoring',
    });
  } else if (ph > 8.2) {
    phStatus = 'Alkaline';
    recommendations.push({
      parameter: 'Soil pH',
      issue: 'Alkaline / Calcareous (pH > 8.2)',
      suggestion: 'Apply agricultural gypsum (calcium sulfate) or elemental sulfur. Use ammonium-based fertilizers to gently reduce alkalinity and improve micronutrient availability (Fe, Zn).',
      actionType: 'Amendment',
    });
  } else if (ph > 7.5) {
    phStatus = 'Slightly Alkaline';
    recommendations.push({
      parameter: 'Soil pH',
      issue: 'Slightly Alkaline (pH 7.5 - 8.2)',
      suggestion: 'Incorporate well-rotted farmyard manure (FYM) and bio-fertilizers to enhance zinc and iron solubility.',
      actionType: 'Organic Supplement',
    });
  } else {
    recommendations.push({
      parameter: 'Soil pH',
      issue: 'Balanced / Optimal (pH 6.5 - 7.5)',
      suggestion: 'Ideal macronutrient and micronutrient bioavailability. Maintain current organic practices.',
      actionType: 'Maintenance',
    });
  }

  // 2. Nitrogen (N)
  let nitrogenStatus = 'Sufficient';
  if (nitrogen < 140) {
    nitrogenStatus = 'Low';
    recommendations.push({
      parameter: 'Nitrogen (N)',
      issue: 'Nitrogen Deficiency (< 140 kg/ha)',
      suggestion: 'Apply split doses of neem-coated urea or ammonium nitrate. Integrate green manuring with leguminous crops (dhaincha or sunn hemp) to fix atmospheric nitrogen.',
      actionType: 'Fertilization',
    });
  } else if (nitrogen > 280) {
    nitrogenStatus = 'High';
    recommendations.push({
      parameter: 'Nitrogen (N)',
      issue: 'Excess Nitrogen (> 280 kg/ha)',
      suggestion: 'Reduce synthetic nitrogen application. Excessive vegetative growth increases susceptibility to lodging and pest attacks like stem borers.',
      actionType: 'Reduction',
    });
  }

  // 3. Phosphorus (P)
  let phosphorusStatus = 'Sufficient';
  if (phosphorus < 15) {
    phosphorusStatus = 'Low';
    recommendations.push({
      parameter: 'Phosphorus (P)',
      issue: 'Phosphorus Deficiency (< 15 kg/ha)',
      suggestion: 'Apply Single Super Phosphate (SSP) or DAP at root level. Inoculate with Phosphate Solubilizing Bacteria (PSB) to release fixed soil phosphorus.',
      actionType: 'Fertilization',
    });
  } else if (phosphorus > 35) {
    phosphorusStatus = 'High';
    recommendations.push({
      parameter: 'Phosphorus (P)',
      issue: 'High Phosphorus (> 35 kg/ha)',
      suggestion: 'Phosphorus is plentiful. Pause P fertilization to prevent interference with zinc and iron uptake.',
      actionType: 'Monitoring',
    });
  }

  // 4. Potassium (K)
  let potassiumStatus = 'Sufficient';
  if (potassium < 120) {
    potassiumStatus = 'Low';
    recommendations.push({
      parameter: 'Potassium (K)',
      issue: 'Potassium Deficiency (< 120 kg/ha)',
      suggestion: 'Apply Muriate of Potash (MOP) or organic wood ash. Potassium enhances drought tolerance, pest resistance, and grain filling quality.',
      actionType: 'Fertilization',
    });
  } else if (potassium > 250) {
    potassiumStatus = 'High';
    recommendations.push({
      parameter: 'Potassium (K)',
      issue: 'High Potassium (> 250 kg/ha)',
      suggestion: 'Adequate potassium reservoir. Avoid excessive potash inputs that could hinder magnesium uptake.',
      actionType: 'Maintenance',
    });
  }

  // 5. Organic Matter
  if (organicMatter < 1.0) {
    recommendations.push({
      parameter: 'Organic Carbon',
      issue: 'Low Soil Organic Carbon (< 1.0%)',
      suggestion: 'Add 5-8 tons of vermicompost or decomposed cow dung manure per hectare. Practice mulching to retain carbon and stimulate earthworm activity.',
      actionType: 'Soil Conditioning',
    });
  }

  // 6. Moisture
  if (moisture < 20) {
    recommendations.push({
      parameter: 'Soil Moisture',
      issue: 'Low Moisture (< 20%)',
      suggestion: 'Soil is dry. Schedule irrigation within 24-48 hours and adopt drip irrigation to preserve moisture in root zones.',
      actionType: 'Irrigation',
    });
  } else if (moisture > 45) {
    recommendations.push({
      parameter: 'Soil Moisture',
      issue: 'Waterlogged Conditions (> 45%)',
      suggestion: 'Excessive water retention. Clear boundary furrows and drain standing water to prevent root hypoxia.',
      actionType: 'Drainage',
    });
  }

  // Overall rating computation
  let score = 0;
  if (phStatus === 'Optimal / Neutral') score += 25; else if (phStatus.includes('Slightly')) score += 18; else score += 8;
  if (nitrogenStatus === 'Sufficient') score += 25; else score += 12;
  if (phosphorusStatus === 'Sufficient') score += 25; else score += 12;
  if (potassiumStatus === 'Sufficient') score += 25; else score += 12;

  let overallRating = 'Good';
  if (score >= 85) overallRating = 'Excellent';
  else if (score >= 65) overallRating = 'Good';
  else if (score >= 45) overallRating = 'Fair';
  else overallRating = 'Poor';

  return {
    interpretation: {
      phStatus,
      nitrogenStatus,
      phosphorusStatus,
      potassiumStatus,
      overallRating,
      fertilityScore: score,
    },
    recommendations,
  };
};

module.exports = {
  interpretSoilMetrics,
};
