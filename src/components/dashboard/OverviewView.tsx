import React from 'react';
import {
  ArrowRight,
  CloudRain,
  Download,
  Droplets,
  Lightbulb,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Sprout,
  Thermometer,
  Zap,
} from 'lucide-react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer } from 'recharts';
import { CropIconIllustration, DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import type {
  AnalysisRecord,
  ClimateObservationRecord,
  DashboardTab,
  Farm,
  SoilProfile,
  User,
} from '../../types/agrolens';

interface OverviewViewProps {
  user: User;
  farm: Farm;
  soil: SoilProfile | null;
  climate: ClimateObservationRecord | null;
  analysis: AnalysisRecord | null;
  refreshingClimate: boolean;
  onRefreshClimate: () => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

export function OverviewView({
  user,
  farm,
  soil,
  climate,
  analysis,
  refreshingClimate,
  onRefreshClimate,
  onNavigateTab,
}: OverviewViewProps) {
  const firstName = user.fullName.split(' ')[0] || 'Farmer';
  const last7 = climate?.observations.slice(-7) ?? [];

  const soilMoisturePct = climate?.summary.avgSoilMoisturePct ?? 64;
  const moistureGaugeColor =
    soilMoisturePct >= 45 && soilMoisturePct <= 80 ? '#16A34A' : '#D97706';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D]">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">
              Welcome back, <span className="text-[#FDE047]">{firstName}!</span>
            </h1>
            <p className="text-sm sm:text-base text-[#DCFCE7]">
              Make evidence-supported crop rotation decisions with NASA Earth observation data for {farm.name}.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('rotation-lab')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#093A17]/90 border border-[#4ADE80]/50 text-white text-sm font-semibold hover:bg-[#072B11] transition-colors cursor-pointer"
              >
                Explore Rotation Strategies
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white/95 text-[#0F1F14] rounded-xl px-5 py-3.5 flex items-center gap-3 self-start md:self-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[#EAF6EB] text-[#15803D] flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B4D1E]">Oyo Pilot Scope</p>
              <p className="text-xs text-[#4B6352]">Maize · Cowpea · Soybean</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Environmental Overview */}
          <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#16A34A]" />
                <h2 className="font-display text-lg font-bold text-[#0F1F14]">Environmental Overview</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#4B6352]">
                <span>
                  {climate?.isLiveNasaFetch ? 'NASA POWER Live' : 'Regional Climatology'} ·{' '}
                  {climate ? `${climate.rangeDays}d window` : 'Loading...'}
                </span>
                <button
                  type="button"
                  onClick={onRefreshClimate}
                  disabled={refreshingClimate}
                  className="p-1.5 rounded-lg border border-[#CFE2D0] hover:bg-[#F4F8F4] text-[#0B4D1E] cursor-pointer disabled:opacity-50"
                  title="Refresh NASA POWER observations"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingClimate ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Rainfall */}
              <div className="bg-[#F4F9F4] border border-[#DFEBDF] rounded-xl p-4 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F4735]">
                    <CloudRain className="w-4 h-4 text-[#0284C7]" />
                    <span>Rainfall</span>
                  </div>
                  <p className="font-display text-2xl font-extrabold text-[#0F1F14] mt-1 tabular-nums">
                    {climate ? `${climate.summary.totalRainfallMm} mm` : '--'}
                  </p>
                  <p className="text-[11px] text-[#4B6352] mt-0.5">
                    {climate?.summary.rainfallTrendPct !== null && climate?.summary.rainfallTrendPct !== undefined
                      ? `${climate.summary.rainfallTrendPct >= 0 ? '+' : ''}${climate.summary.rainfallTrendPct}% vs prior half`
                      : 'NASA POWER PRECTOTCORR'}
                  </p>
                </div>
                <div className="w-20 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7}>
                      <Bar dataKey="rainfallMm" fill="#22C55E" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-[#F4F9F4] border border-[#DFEBDF] rounded-xl p-4 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F4735]">
                    <Thermometer className="w-4 h-4 text-[#16A34A]" />
                    <span>Temperature</span>
                  </div>
                  <p className="font-display text-2xl font-extrabold text-[#0F1F14] mt-1 tabular-nums">
                    {climate ? `${climate.summary.avgTempC}°C` : '--'}
                  </p>
                  <p className="text-[11px] text-[#4B6352] mt-0.5">
                    {climate ? `Max ${climate.summary.maxTempC}°C · T2M` : 'NASA POWER T2M'}
                  </p>
                </div>
                <div className="w-20 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={last7}>
                      <Line type="monotone" dataKey="tempMeanC" stroke="#15803D" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Soil Moisture */}
              <div className="bg-[#F4F9F4] border border-[#DFEBDF] rounded-xl p-4 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F4735]">
                    <Droplets className="w-4 h-4 text-[#15803D]" />
                    <span>Soil Wetness</span>
                  </div>
                  <p className="font-display text-2xl font-extrabold text-[#0F1F14] mt-1 tabular-nums">
                    {climate ? `${soilMoisturePct}%` : '--'}
                  </p>
                  <p className="text-[11px] font-semibold text-[#15803D] mt-0.5">
                    {climate?.summary.moistureStatus || 'Optimal'} (MERRA-2)
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4"
                  style={{ borderColor: moistureGaugeColor }}
                >
                  <Sprout className="w-5 h-5 text-[#15803D]" />
                </div>
              </div>
            </div>
          </section>

          {/* Rotation Strategy Workspace Preview */}
          <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0F1F14]">Your Rotation Strategy Workspace</h2>
                <p className="text-xs text-[#4B6352]">
                  Candidate sequences evaluated against NASA observations, soil status, and your priorities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('rotation-lab')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B4D1E] hover:underline cursor-pointer"
              >
                Open Strategy Lab
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(analysis?.strategies.slice(0, 3) ?? []).map((strat) => {
                const isRec = strat.rotationPlanId === analysis?.recommendedStrategyId;
                return (
                  <div
                    key={strat.rotationPlanId}
                    className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 ${
                      isRec ? 'border-[#22C55E] bg-[#F6FBF6]' : 'border-[#DFEBDF] bg-white'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0B4D1E]">{strat.code}</span>
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

                      <div className="flex items-center justify-center gap-1.5 py-1">
                        {strat.sequence.map((crop, idx) => (
                          <React.Fragment key={`${crop}-${idx}`}>
                            <CropIconIllustration cropName={crop} className="w-10 h-10" />
                            {idx < strat.sequence.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-[#6B8271] shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div>
                        <p className="font-display text-sm font-bold text-[#0F1F14]">
                          {strat.sequence.join(' → ')}
                        </p>
                        <p className="text-xs text-[#4B6352] mt-1 line-clamp-2">{strat.label}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-[#E6EFE6]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#4B6352]">
                          Suitability: <strong className="text-[#0F1F14] tabular-nums">{strat.suitabilityScore}/100</strong>
                        </span>
                        <span className="text-[#4B6352]">
                          Confidence: <strong className="text-[#0B4D1E] tabular-nums">{strat.confidenceScore}%</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('rotation-lab')}
                        className="w-full py-2 rounded-lg bg-[#EAF4EA] hover:bg-[#DCF0DC] text-xs font-semibold text-[#0B4D1E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          {/* My Farm Card */}
          <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#0F1F14]">My Farm</h2>
              <span className="text-xs font-semibold text-[#15803D]">{farm.status}</span>
            </div>

            <div className="rounded-xl bg-[#EDF6EE] border border-[#CFE2D0] p-4 space-y-2">
              <p className="font-display text-base font-bold text-[#0F1F14]">{farm.name}</p>
              <div className="space-y-1.5 text-xs text-[#364F3D]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>
                    {farm.city ? `${farm.city}, ` : ''}{farm.lga}, {farm.state}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Area</span>
                  <span className="font-semibold tabular-nums">{farm.sizeHectares} Hectares</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Soil pH</span>
                  <span className="font-semibold tabular-nums">
                    {soil?.ph !== null && soil?.ph !== undefined
                      ? `${soil.ph} (${soil.source.replace('_', ' ')})`
                      : 'Missing (Lab test needed)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Crop</span>
                  <span className="font-semibold">{farm.currentCrop}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('my-farm')}
              className="w-full py-2.5 rounded-lg bg-[#EAF4EA] hover:bg-[#DCF0DC] text-xs font-semibold text-[#0B4D1E] transition-colors cursor-pointer"
            >
              View Farm Details
            </button>
          </section>

          {/* Quick Actions */}
          <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0B4D1E]" />
              <h2 className="font-display text-base font-bold text-[#0F1F14]">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('environmental')}
                className="p-3.5 rounded-xl bg-[#EDF6EE] hover:bg-[#DFF0E1] text-left space-y-1.5 transition-colors cursor-pointer"
              >
                <CloudRain className="w-5 h-5 text-[#0284C7]" />
                <p className="text-xs font-semibold text-[#0F1F14]">Check NASA Climate</p>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('my-farm')}
                className="p-3.5 rounded-xl bg-[#EDF6EE] hover:bg-[#DFF0E1] text-left space-y-1.5 transition-colors cursor-pointer"
              >
                <Sprout className="w-5 h-5 text-[#15803D]" />
                <p className="text-xs font-semibold text-[#0F1F14]">Update Soil Profile</p>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('field-risk')}
                className="p-3.5 rounded-xl bg-[#EDF6EE] hover:bg-[#DFF0E1] text-left space-y-1.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-5 h-5 text-[#D97706]" />
                <p className="text-xs font-semibold text-[#0F1F14]">View Field Risk</p>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('reports')}
                className="p-3.5 rounded-xl bg-[#EDF6EE] hover:bg-[#DFF0E1] text-left space-y-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-5 h-5 text-[#0B4D1E]" />
                <p className="text-xs font-semibold text-[#0F1F14]">Decision Report</p>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Did you know scientific nuance banner */}
      <section className="bg-[#E6F4E7] border border-[#CFE2D0] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-[#15803D] flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0F1F14]">Scientific Note on Legume Rotations</p>
            <p className="text-xs sm:text-sm text-[#364F3D] mt-0.5">
              Rotating maize with cowpea or soybean helps disrupt pest cycles, but soil fertility gains are not
              automatic—retaining crop residues, adequate soil phosphorus, and local pH management are essential.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('crops')}
          className="px-4 py-2 rounded-lg bg-[#0B4D1E] text-white text-xs font-semibold hover:bg-[#146C2E] transition-colors shrink-0 cursor-pointer"
        >
          Read Crop Guide
        </button>
      </section>
    </div>
  );
}
