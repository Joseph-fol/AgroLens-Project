import React, { useState } from 'react';
import {
  ArrowRight,
  CloudRain,
  Droplets,
  Info,
  RefreshCw,
  Satellite,
  Sprout,
  Thermometer,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import { LeafletFarmMap } from '../LeafletFarmMap';
import type { ClimateObservationRecord, DashboardTab, Farm } from '../../types/agrolens';

interface EnvironmentalViewProps {
  farm: Farm;
  climate: ClimateObservationRecord | null;
  rangeDays: number;
  loading: boolean;
  onChangeRange: (days: number) => void;
  onForceRefresh: () => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

const RANGES = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '1 Year', days: 365 },
];

export function EnvironmentalView({
  farm,
  climate,
  rangeDays,
  loading,
  onChangeRange,
  onForceRefresh,
  onNavigateTab,
}: EnvironmentalViewProps) {
  const [metric, setMetric] = useState<'rainfallMm' | 'tempMeanC' | 'surfaceSoilWetnessPct'>('rainfallMm');

  const chartData = (climate?.observations ?? []).map((o) => ({
    ...o,
    shortDate: o.date.slice(5),
  }));

  const metricMeta = {
    rainfallMm: { label: 'Rainfall (mm)', unit: 'mm', color: '#16A34A' },
    tempMeanC: { label: 'Mean Temperature (°C)', unit: '°C', color: '#EA580C' },
    surfaceSoilWetnessPct: { label: 'Surface Soil Wetness (%)', unit: '%', color: '#0284C7' },
  }[metric];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D]">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#86EFAC] text-xs font-semibold">
                <Satellite className="w-4 h-4" />
                <span>Powered by NASA Earth Observation Data</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Environmental Intelligence</h1>
              <p className="text-sm text-[#DCFCE7] max-w-2xl">
                Historical rainfall, temperature, and MERRA-2 / SMAP soil wetness retrieved for {farm.name} (
                {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E).
              </p>
            </div>

            <button
              type="button"
              onClick={onForceRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#0B4D1E] text-xs font-bold hover:bg-[#EAF6EB] transition-colors self-start lg:self-center cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Querying NASA POWER...' : 'Fetch Live NASA Data'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => onChangeRange(r.days)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  rangeDays === r.days
                    ? 'bg-white text-[#0B4D1E]'
                    : 'bg-[#093A17]/70 text-[#DCFCE7] border border-white/20 hover:bg-[#093A17]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3 KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DFEBDF] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4B6352] flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-[#0284C7]" />
              Cumulative Rainfall ({rangeDays}d)
            </p>
            <p className="font-display text-3xl font-extrabold text-[#0F1F14] mt-1 tabular-nums">
              {climate ? `${climate.summary.totalRainfallMm} mm` : '--'}
            </p>
            <p className="text-xs text-[#4B6352] mt-1 tabular-nums">
              Avg {climate ? `${climate.summary.avgDailyRainfallMm} mm/day` : '--'} ·{' '}
              {climate ? `${climate.summary.drySpellDays} dry days (<1mm)` : ''}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#DFEBDF] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4B6352] flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#EA580C]" />
              Mean Temperature ({rangeDays}d)
            </p>
            <p className="font-display text-3xl font-extrabold text-[#0F1F14] mt-1 tabular-nums">
              {climate ? `${climate.summary.avgTempC}°C` : '--'}
            </p>
            <p className="text-xs text-[#4B6352] mt-1 tabular-nums">
              Range {climate ? `${climate.summary.minTempC}°C – ${climate.summary.maxTempC}°C` : '--'} ·{' '}
              {climate ? `${climate.summary.heatStressDays} heat stress days` : ''}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#DFEBDF] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#4B6352] flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#16A34A]" />
              Surface / Root Wetness
            </p>
            <p className="font-display text-3xl font-extrabold text-[#0F1F14] mt-1 tabular-nums">
              {climate ? `${climate.summary.avgSoilMoisturePct}%` : '--'}
            </p>
            <p className="text-xs font-semibold text-[#15803D] mt-1 tabular-nums">
              {climate ? `${climate.summary.moistureStatus} · Root Zone ${climate.summary.avgRootZoneMoisturePct}%` : ''}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-[#16A34A] flex items-center justify-center">
            <Sprout className="w-5 h-5 text-[#15803D]" />
          </div>
        </div>
      </div>

      {/* Trend Chart + Spatial Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0F1F14]">Environmental Trends</h2>
              <p className="text-xs text-[#4B6352]">
                {climate?.provenance[0]?.archiveWindowUsed || 'Historical observation window'}
              </p>
            </div>
            <div className="inline-flex p-1 rounded-lg bg-[#F1F6F1] border border-[#DFEBDF]">
              {(
                [
                  { id: 'rainfallMm', label: 'Rainfall' },
                  { id: 'tempMeanC', label: 'Temperature' },
                  { id: 'surfaceSoilWetnessPct', label: 'Soil Wetness' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMetric(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    metric === tab.id ? 'bg-[#0B4D1E] text-white' : 'text-[#364F3D] hover:text-[#0F1F14]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full rounded-xl bg-[#F4F8F4] flex items-center justify-center text-sm text-[#4B6352]">
                Retrieving NASA POWER observations...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="envFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricMeta.color} stopOpacity={0.32} />
                      <stop offset="95%" stopColor={metricMeta.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE6" />
                  <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: '#4B6352' }} minTickGap={18} />
                  <YAxis tick={{ fontSize: 11, fill: '#4B6352' }} />
                  <Tooltip
                    formatter={(val: unknown) => [`${val} ${metricMeta.unit}`, metricMeta.label]}
                    contentStyle={{
                      borderRadius: 10,
                      borderColor: '#CFE2D0',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={metricMeta.color}
                    strokeWidth={2.5}
                    fill="url(#envFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-[#0F1F14]">Spatial Footprint Map</h2>
            <button
              type="button"
              onClick={() => onNavigateTab('field-risk')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B4D1E] hover:underline cursor-pointer"
            >
              View Full Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <LeafletFarmMap
            latitude={farm.latitude}
            longitude={farm.longitude}
            farmName={farm.name}
            boundary={farm.boundary}
            showNasaGrid
            heightClass="h-64"
          />
          <p className="text-xs text-[#4B6352] leading-relaxed">
            Blue dashed box shows the NASA POWER <span className="font-mono">0.5° × 0.625°</span> grid cell (~55 km),
            and teal shows the GPM IMERG <span className="font-mono">0.1°</span> grid (~11 km). Large-area satellite
            averages do not represent single-plot microclimate.
          </p>
        </section>
      </div>

      {/* Provenance & Quality Table */}
      <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-[#15803D]" />
          <h2 className="font-display text-lg font-bold text-[#0F1F14]">
            NASA Dataset Provenance, Units &amp; Limitations
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E2EBE2] text-xs text-[#4B6352]">
                <th className="py-2.5 pr-4 font-semibold">Dataset</th>
                <th className="py-2.5 pr-4 font-semibold">Measurement Type</th>
                <th className="py-2.5 pr-4 font-semibold">Spatial Resolution</th>
                <th className="py-2.5 pr-4 font-semibold">Quality / Status</th>
                <th className="py-2.5 font-semibold">Known Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF4EE]">
              {(climate?.provenance ?? []).map((p) => (
                <tr key={p.datasetName}>
                  <td className="py-3 pr-4 font-semibold text-[#0F1F14] align-top">
                    {p.datasetName}
                    <p className="text-xs font-normal text-[#4B6352] mt-0.5">{p.role}</p>
                  </td>
                  <td className="py-3 pr-4 text-[#364F3D] align-top">{p.measurementType}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-[#0B4D1E] align-top">{p.spatialResolution}</td>
                  <td className="py-3 pr-4 align-top">
                    <span className="font-semibold text-[#15803D]">{p.qualityFlag}</span>
                    <p className="text-[11px] text-[#4B6352] mt-0.5">{p.archiveWindowUsed}</p>
                  </td>
                  <td className="py-3 text-xs text-[#4B6352] align-top max-w-md">{p.limitations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
