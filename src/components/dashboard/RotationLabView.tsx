import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Plus,
  RefreshCw,
  Scale,
  SlidersHorizontal,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CropIconIllustration, DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import { api } from '../../services/api';
import type { AnalysisRecord, DashboardTab, FarmerPriorities, Farm } from '../../types/agrolens';

interface RotationLabViewProps {
  farm: Farm;
  analysis: AnalysisRecord | null;
  priorities: FarmerPriorities;
  running: boolean;
  onUpdatePriorities: (p: FarmerPriorities) => void;
  onRunAnalysis: (p: FarmerPriorities) => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

export function RotationLabView({
  farm,
  analysis,
  priorities,
  running,
  onUpdatePriorities,
  onRunAnalysis,
  onNavigateTab,
}: RotationLabViewProps) {
  const strategies = analysis?.strategies ?? [];
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    analysis?.recommendedStrategyId || strategies[0]?.rotationPlanId || ''
  );
  const [chartMode, setChartMode] = useState<'overview' | 'criteria'>('overview');

  // Custom rotation builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [seq1, setSeq1] = useState('Cowpea');
  const [seq2, setSeq2] = useState('Maize');
  const [seq3, setSeq3] = useState('Soybean');
  const [creatingCustom, setCreatingCustom] = useState(false);

  const activeStrategy =
    strategies.find((s) => s.rotationPlanId === selectedStrategyId) ||
    strategies.find((s) => s.rotationPlanId === analysis?.recommendedStrategyId) ||
    strategies[0];

  const totalWeight =
    priorities.soilHealth +
      priorities.waterConservation +
      priorities.climateResilience +
      priorities.economicSuitability +
      priorities.erosionReduction || 1;

  const chartData = strategies.map((s) => ({
    name: `${s.code}`,
    Suitability: s.suitabilityScore,
    Confidence: s.confidenceScore,
    SoilHealth: s.criterionScores.soilHealth ?? 0,
    WaterEfficiency: s.criterionScores.waterConservation ?? 0,
    ClimateResilience: s.criterionScores.climateResilience ?? 0,
  }));

  async function handleCreateCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customLabel.trim()) return;
    setCreatingCustom(true);
    try {
      await api.rotations.create({
        farmId: farm.id,
        label: customLabel.trim(),
        sequence: [seq1, seq2, seq3],
      });
      setShowBuilder(false);
      setCustomLabel('');
      onRunAnalysis(priorities);
    } finally {
      setCreatingCustom(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D]">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86EFAC]">
              <RefreshCw className="w-4 h-4" />
              Weighted Multi-Criteria Decision Engine ({analysis?.methodologyVersion || 'agrolens-v1.0'})
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Rotation Strategy Lab</h1>
            <p className="text-sm text-[#DCFCE7] max-w-2xl">
              Compare your existing baseline practice against candidate legume rotations using transparent weights and
              separate evidence confidence ratings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBuilder(!showBuilder)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#0B4D1E] text-xs font-bold hover:bg-[#EAF6EB] transition-colors self-start md:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Custom Rotation
          </button>
        </div>
      </section>

      {/* Custom Rotation Builder */}
      {showBuilder && (
        <form
          onSubmit={handleCreateCustom}
          className="bg-white border border-[#22C55E] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-5 gap-4 items-end"
        >
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-[#233B2A]">Strategy Label</label>
            <input
              type="text"
              required
              placeholder="e.g., Cowpea Lead Sequence"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-sm"
            />
          </div>
          {[
            { label: 'Season 1', val: seq1, set: setSeq1 },
            { label: 'Season 2', val: seq2, set: setSeq2 },
            { label: 'Season 3', val: seq3, set: setSeq3 },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <label className="text-xs font-semibold text-[#233B2A]">{item.label}</label>
              <select
                value={item.val}
                onChange={(e) => item.set(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white"
              >
                <option value="Maize">Maize</option>
                <option value="Cowpea">Cowpea</option>
                <option value="Soybean">Soybean</option>
              </select>
            </div>
          ))}
          <div className="sm:col-span-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="px-4 py-2 rounded-lg border border-[#CFE2D0] text-xs font-semibold text-[#4B6352] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingCustom}
              className="px-4 py-2 rounded-lg bg-[#0B4D1E] text-white text-xs font-semibold hover:bg-[#146C2E] cursor-pointer"
            >
              {creatingCustom ? 'Adding...' : 'Save & Evaluate Strategy'}
            </button>
          </div>
        </form>
      )}

      {/* Strategy Cards + Priority Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#15803D]" />
              <h2 className="font-display text-lg font-bold text-[#0F1F14]">Compare Candidate Rotation Strategies</h2>
            </div>
            <span className="text-xs text-[#4B6352]">
              Formula: <span className="font-mono">S_j = Σ(w_i × s_ij) / Σw_i</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strat) => {
              const isSelected = activeStrategy?.rotationPlanId === strat.rotationPlanId;
              return (
                <button
                  key={strat.rotationPlanId}
                  type="button"
                  onClick={() => setSelectedStrategyId(strat.rotationPlanId)}
                  className={`text-left rounded-xl border p-4 transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'border-[#16A34A] bg-[#F5FBF5] ring-1 ring-[#16A34A]'
                      : 'border-[#DFEBDF] bg-white hover:border-[#86EFAC]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0B4D1E]">
                      {strat.code} · {strat.label}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        strat.badgeLabel === 'Recommended'
                          ? 'text-[#15803D]'
                          : strat.isBaseline
                          ? 'text-[#B45309]'
                          : 'text-[#4B6352]'
                      }`}
                    >
                      {strat.badgeLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    {strat.sequence.map((crop, idx) => (
                      <React.Fragment key={`${crop}-${idx}`}>
                        <div className="flex flex-col items-center">
                          <CropIconIllustration cropName={crop} className="w-10 h-10" />
                          <span className="text-[11px] font-semibold text-[#233B2A] mt-0.5">{crop}</span>
                        </div>
                        {idx < strat.sequence.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-[#6B8271] shrink-0 mb-3" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <ul className="space-y-1 text-xs text-[#364F3D]">
                    {strat.benefits.slice(0, 2).map((b) => (
                      <li key={b} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Suitability vs Confidence strictly separated */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#E6EFE6] bg-[#EDF6EE]/70 rounded-lg p-2.5 text-center">
                    <div>
                      <p className="text-[10px] text-[#4B6352]">Suitability</p>
                      <p className="text-sm font-extrabold text-[#0B4D1E] tabular-nums">{strat.suitabilityScore}/100</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4B6352]">Confidence</p>
                      <p className="text-sm font-extrabold text-[#0F1F14] tabular-nums">{strat.confidenceScore}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#4B6352]">Soil Rating</p>
                      <p className="text-xs font-bold text-[#15803D] mt-0.5">{strat.soilHealthRating}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Farmer Priority Sliders */}
        <aside className="lg:col-span-4 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-[#0F1F14] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#16A34A]" />
              Adjust Farmer Priorities
            </h2>
            <p className="text-xs text-[#4B6352]">Weight what matters most for {farm.name}.</p>
          </div>

          <div className="space-y-4">
            {(
              [
                { key: 'soilHealth', label: 'Soil Health & Fertility' },
                { key: 'waterConservation', label: 'Water Conservation' },
                { key: 'climateResilience', label: 'Climate & Heat Resilience' },
                { key: 'economicSuitability', label: 'Economic Suitability' },
                { key: 'erosionReduction', label: 'Erosion Reduction' },
              ] as const
            ).map((item) => {
              const raw = priorities[item.key];
              const pct = Math.round((raw / totalWeight) * 100);
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#233B2A]">{item.label}</span>
                    <span className="font-mono font-bold text-[#0B4D1E] tabular-nums">{pct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={raw}
                    onChange={(e) =>
                      onUpdatePriorities({
                        ...priorities,
                        [item.key]: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#16A34A] cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onRunAnalysis(priorities)}
            disabled={running}
            className="w-full py-3 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors cursor-pointer disabled:opacity-60"
          >
            {running ? 'Recalculating Scores...' : 'Update Analysis'}
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="w-full py-2.5 rounded-lg border border-[#CFE2D0] text-xs font-semibold text-[#0B4D1E] hover:bg-[#EDF6EE] transition-colors cursor-pointer"
          >
            Open Full Decision Report
          </button>
        </aside>
      </div>

      {/* Bottom Comparison Chart + Evidence/Risks Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#0F1F14]">Strategy Comparison Chart</h2>
            <div className="inline-flex p-1 rounded-lg bg-[#F1F6F1] border border-[#DFEBDF]">
              <button
                type="button"
                onClick={() => setChartMode('overview')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  chartMode === 'overview' ? 'bg-[#0B4D1E] text-white' : 'text-[#364F3D]'
                }`}
              >
                Suitability vs Confidence
              </button>
              <button
                type="button"
                onClick={() => setChartMode('criteria')}
                className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  chartMode === 'criteria' ? 'bg-[#0B4D1E] text-white' : 'text-[#364F3D]'
                }`}
              >
                Criteria Breakdown
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0F1F14', fontWeight: 600 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#4B6352' }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#CFE2D0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {chartMode === 'overview' ? (
                  <>
                    <Bar dataKey="Suitability" fill="#0B4D1E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Confidence" fill="#65A30D" radius={[4, 4, 0, 0]} />
                  </>
                ) : (
                  <>
                    <Bar dataKey="SoilHealth" name="Soil Health" fill="#0B4D1E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="WaterEfficiency" name="Water" fill="#16A34A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ClimateResilience" name="Climate" fill="#84CC16" radius={[4, 4, 0, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {activeStrategy && (
          <section className="lg:col-span-6 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EFE6] pb-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0F1F14]">
                  {activeStrategy.code}: {activeStrategy.sequence.join(' → ')}
                </h2>
                <p className="text-xs text-[#4B6352]">{activeStrategy.label}</p>
              </div>
              <span className="text-xs font-bold text-[#0B4D1E] tabular-nums">
                Score {activeStrategy.suitabilityScore} · Conf {activeStrategy.confidenceScore}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-[#0B4D1E] mb-1">Supporting Environmental &amp; Agronomic Evidence</p>
                <ul className="space-y-1 text-[#233B2A]">
                  {activeStrategy.evidence.map((ev) => (
                    <li key={ev}>• {ev}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-bold text-[#B45309] mb-1">Risks &amp; Management Conditions</p>
                <ul className="space-y-1 text-[#364F3D]">
                  {activeStrategy.risks.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>

              {activeStrategy.missingInfo.length > 0 && (
                <div className="rounded-xl bg-[#FEF9C3]/60 border border-[#FDE047] p-3 space-y-1">
                  <p className="font-bold text-[#854D0E] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing Data &amp; Uncertainty Disclosure
                  </p>
                  <ul className="space-y-0.5 text-[#713F12]">
                    {activeStrategy.missingInfo.map((m) => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                  <p className="text-[#713F12] pt-1">{activeStrategy.uncertaintyNote}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
