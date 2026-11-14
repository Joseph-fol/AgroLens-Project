import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Droplets,
  FlaskConical,
  Sprout,
  Thermometer,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CropIconIllustration, DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import type { CropProfile, DashboardTab } from '../../types/agrolens';

interface CropIntelligenceViewProps {
  crops: CropProfile[];
  onNavigateTab: (tab: DashboardTab) => void;
}

export function CropIntelligenceView({ crops, onNavigateTab }: CropIntelligenceViewProps) {
  const [selectedId, setSelectedId] = useState<string>(crops[0]?.id || 'maize');
  const [chartMetric, setChartMetric] = useState<'yieldPotentialTonHa' | 'waterRequirementMmMax' | 'durationDaysMax'>(
    'yieldPotentialTonHa'
  );

  const selectedCrop = crops.find((c) => c.id === selectedId) || crops[0];

  const chartData = crops.map((c) => ({
    name: c.name,
    value: c[chartMetric],
  }));

  const metricLabel = {
    yieldPotentialTonHa: 'Yield Potential (t/ha)',
    waterRequirementMmMax: 'Max Seasonal Water Demand (mm)',
    durationDaysMax: 'Max Growing Duration (days)',
  }[chartMetric];

  const barColors = ['#0B4D1E', '#16A34A', '#65A30D'];

  if (!selectedCrop) {
    return <div className="p-8 text-sm text-[#4B6352]">Loading crop intelligence catalogue...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D]">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86EFAC]">
              <Sprout className="w-4 h-4" />
              Oyo State Agronomic Catalogue
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Crop Intelligence</h1>
            <p className="text-sm text-[#DCFCE7] max-w-2xl">
              Structured characteristics, planting windows, water/pH tolerances, and management caveats for maize,
              cowpea, and soybean.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('rotation-lab')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#0B4D1E] text-xs font-bold hover:bg-[#EAF6EB] transition-colors self-start md:self-center cursor-pointer"
          >
            Explore Rotation Strategies
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3 Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {crops.map((crop) => {
          const isSelected = crop.id === selectedCrop.id;
          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => setSelectedId(crop.id)}
              className={`text-left rounded-2xl border p-5 transition-all cursor-pointer space-y-4 ${
                isSelected
                  ? 'bg-[#F4FAF4] border-[#22C55E] ring-1 ring-[#22C55E]'
                  : 'bg-white border-[#DFEBDF] hover:border-[#86EFAC]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CropIconIllustration cropName={crop.name} className="w-13 h-13 shrink-0" />
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#0F1F14]">{crop.name}</h2>
                    <p className="text-xs italic text-[#4B6352]">{crop.scientificName}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#15803D]">
                  {isSelected ? 'Selected' : 'Inspect'}
                </span>
              </div>

              <p className="text-xs text-[#364F3D] leading-relaxed">{crop.summary}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E6EFE6] text-xs">
                <div>
                  <p className="text-[11px] text-[#4B6352]">Duration</p>
                  <p className="font-bold text-[#0F1F14] tabular-nums">
                    {crop.durationDaysMin}–{crop.durationDaysMax}d
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#4B6352]">Water</p>
                  <p className="font-bold text-[#0F1F14] tabular-nums">
                    {crop.waterRequirementMmMin}–{crop.waterRequirementMmMax} mm
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#4B6352]">Soil pH</p>
                  <p className="font-bold text-[#0F1F14] tabular-nums">
                    {crop.phMin}–{crop.phMax}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Crop Details + Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EFE6] pb-4">
            <div className="flex items-center gap-3">
              <CropIconIllustration cropName={selectedCrop.name} className="w-12 h-12" />
              <div>
                <h2 className="font-display text-xl font-bold text-[#0F1F14]">
                  {selectedCrop.name}{' '}
                  <span className="text-sm font-normal text-[#4B6352]">
                    ({selectedCrop.scientificName} · {selectedCrop.family})
                  </span>
                </h2>
                <p className="text-xs text-[#4B6352] mt-0.5">{selectedCrop.summary}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Requirements */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0B4D1E]">Key Climatic &amp; Soil Requirements</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#233B2A]">
                <li className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4 text-[#EA580C] shrink-0" />
                  <span>
                    Optimal Temperature: <strong>{selectedCrop.tempOptimalMinC}–{selectedCrop.tempOptimalMaxC}°C</strong>{' '}
                    (Heat stress &ge; {selectedCrop.heatStressThresholdC}°C)
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-[#0284C7] shrink-0" />
                  <span>
                    Seasonal Water: <strong>{selectedCrop.waterRequirementMmMin}–{selectedCrop.waterRequirementMmMax} mm</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <FlaskConical className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>
                    Target Soil pH: <strong>{selectedCrop.phMin}–{selectedCrop.phMax}</strong> · Nutrients:{' '}
                    {selectedCrop.keyNutrients.join(', ')}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Oyo Windows:</strong> Early ({selectedCrop.oyoPlantingWindows.earlySeason}) · Late (
                    {selectedCrop.oyoPlantingWindows.lateSeason})
                  </span>
                </li>
              </ul>
            </div>

            {/* Growing Tips & Management */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0B4D1E]">Management &amp; Growing Tips</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-[#233B2A]">
                {selectedCrop.growingTips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Root & Nitrogen Fixation Caveat */}
          <div className="rounded-xl bg-[#EDF6EE] border border-[#CFE2D0] p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#0B4D1E]">Root System &amp; Nitrogen-Fixing Profile</h3>
              <span className="text-xs font-semibold text-[#15803D]">
                {selectedCrop.nitrogenFixingPotential.estimateKgHa}
              </span>
            </div>
            <p className="text-xs text-[#233B2A]">{selectedCrop.rootCharacteristics}</p>
            <p className="text-xs font-medium text-[#0F1F14]">
              Caveat: {selectedCrop.nitrogenFixingPotential.managementCaveat}
            </p>
          </div>

          {/* Pest & Disease Risks + References */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#B45309] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Pest, Disease &amp; Agronomic Risks
              </h3>
              <ul className="space-y-1.5 text-xs text-[#364F3D]">
                {selectedCrop.pestAndDiseaseRisks.map((risk) => (
                  <li key={risk}>• {risk}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#0B4D1E] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Credible Agronomic References
              </h3>
              <ul className="space-y-1.5 text-xs text-[#364F3D]">
                {selectedCrop.references.map((ref) => (
                  <li key={ref.title}>
                    <strong className="text-[#0F1F14]">{ref.source}:</strong> {ref.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Right Comparison Chart */}
        <section className="lg:col-span-4 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#0F1F14]">Crop Comparison</h2>
            <select
              value={chartMetric}
              onChange={(e) => setChartMetric(e.target.value as typeof chartMetric)}
              className="px-2.5 py-1.5 rounded-lg border border-[#CFE2D0] text-xs font-semibold text-[#0B4D1E] bg-[#F4F8F4]"
            >
              <option value="yieldPotentialTonHa">Yield Potential (t/ha)</option>
              <option value="waterRequirementMmMax">Water Demand (mm)</option>
              <option value="durationDaysMax">Duration (days)</option>
            </select>
          </div>

          <p className="text-xs text-[#4B6352]">{metricLabel}</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F1F14', fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: '#4B6352' }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#CFE2D0', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={entry.name} fill={barColors[idx % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-[#EDF6EE] p-3.5 text-xs text-[#233B2A] leading-relaxed">
            <strong>Agronomic Balance:</strong> Combining cereals (Maize) with adapted legumes (Cowpea / Soybean)
            diversifies rooting depth, breaks pest cycles, and spreads climate risk across Oyo seasons.
          </div>
        </section>
      </div>
    </div>
  );
}
