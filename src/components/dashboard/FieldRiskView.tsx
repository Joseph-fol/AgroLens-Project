import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Layers, MapPin, ShieldAlert } from 'lucide-react';
import { DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import { LeafletFarmMap } from '../LeafletFarmMap';
import type { ClimateObservationRecord, Farm, SoilProfile } from '../../types/agrolens';

interface FieldRiskViewProps {
  farm: Farm;
  soil: SoilProfile | null;
  climate: ClimateObservationRecord | null;
}

export function FieldRiskView({ farm, soil, climate }: FieldRiskViewProps) {
  const [showNasaGrid, setShowNasaGrid] = useState(true);
  const [riskLayer, setRiskLayer] = useState<'none' | 'heat' | 'moisture' | 'erosion'>('moisture');

  const heatDays = climate?.summary.heatStressDays ?? 0;
  const dryDays = climate?.summary.drySpellDays ?? 0;
  const soilWet = climate?.summary.avgSoilMoisturePct ?? 60;

  return (
    <div className="space-y-6">
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D]">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86EFAC]">
            <ShieldAlert className="w-4 h-4" />
            Spatial Context &amp; Environmental Risk
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Field Risk Explorer</h1>
          <p className="text-sm text-[#DCFCE7] max-w-2xl">
            Inspect {farm.name} boundaries alongside regional NASA grid footprints and climate risk indicators.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-8 bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <h2 className="font-display text-base font-bold text-[#0F1F14]">
                {farm.name} ({farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E)
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#233B2A] bg-[#F4F8F4] px-3 py-1.5 rounded-lg border border-[#CFE2D0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNasaGrid}
                  onChange={(e) => setShowNasaGrid(e.target.checked)}
                  className="accent-[#0B4D1E]"
                />
                Show NASA Grid Footprint
              </label>

              <div className="inline-flex items-center gap-1 bg-[#F4F8F4] p-1 rounded-lg border border-[#CFE2D0]">
                {(
                  [
                    { id: 'moisture', label: 'Moisture' },
                    { id: 'heat', label: 'Heat Stress' },
                    { id: 'erosion', label: 'Erosion' },
                    { id: 'none', label: 'Clear' },
                  ] as const
                ).map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setRiskLayer(layer.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      riskLayer === layer.id ? 'bg-[#0B4D1E] text-white' : 'text-[#364F3D]'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <LeafletFarmMap
            latitude={farm.latitude}
            longitude={farm.longitude}
            farmName={farm.name}
            boundary={farm.boundary}
            showNasaGrid={showNasaGrid}
            riskLayer={riskLayer}
            heightClass="h-[420px]"
          />

          <div className="rounded-xl bg-[#EDF6EE] border border-[#CFE2D0] p-4 flex items-start gap-3 text-xs text-[#233B2A]">
            <Layers className="w-4 h-4 text-[#0B4D1E] shrink-0 mt-0.5" />
            <div>
              <strong>Spatial Resolution Disclaimer:</strong> NASA POWER grid cells cover{' '}
              <span className="font-mono">0.5° × 0.625° (~55 km)</span> and GPM IMERG cells cover{' '}
              <span className="font-mono">0.1° × 0.1° (~11 km)</span>. These layers describe regional atmospheric and
              moisture conditions rather than exact meter-by-meter measurements inside your {farm.sizeHectares} ha parcel.
            </div>
          </div>
        </section>

        {/* Right Risk Breakdown */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-4">
            <h2 className="font-display text-base font-bold text-[#0F1F14]">Active Risk Indicators</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#0F1F14]">
                  <span>Thermal Heat Stress</span>
                  <span className={heatDays > 5 ? 'text-amber-700' : 'text-[#15803D]'}>
                    {heatDays > 5 ? 'Watch' : 'Low'} ({heatDays}d &ge; 34°C)
                  </span>
                </div>
                <p className="text-[#4B6352]">
                  Maize pollination suffers above 34°C; cowpea tolerates warmer late-season windows up to 36°C.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#0F1F14]">
                  <span>Soil Wetness &amp; Dry Spells</span>
                  <span className={soilWet < 45 ? 'text-amber-700' : 'text-[#15803D]'}>
                    {soilWet}% ({dryDays} dry days)
                  </span>
                </div>
                <p className="text-[#4B6352]">
                  {climate?.summary.moistureStatus || 'Optimal'} regional topsoil wetness from MERRA-2/SMAP context.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#0F1F14]">
                  <span>Soil Data Completeness</span>
                  <span className={soil && soil.missingFields.length > 0 ? 'text-amber-700' : 'text-[#15803D]'}>
                    {soil ? `${5 - soil.missingFields.length}/5 tested` : '0/5 tested'}
                  </span>
                </div>
                <p className="text-[#4B6352]">
                  {soil && soil.missingFields.length > 0
                    ? `Missing lab tests (${soil.missingFields.join(', ')}) add uncertainty to nutrient balance estimates.`
                    : 'Laboratory soil test indicators are recorded.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-sm font-bold text-[#0F1F14] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              On-Farm Verification Checklist
            </h3>
            <ul className="space-y-2 text-xs text-[#364F3D]">
              {[
                'Verify topsoil drainage in low-lying field corners before cowpea planting.',
                'Collect composite 0–20 cm soil sample for lab pH and Phosphorus check.',
                'Scout maize whorls for Fall Armyworm after onset of rains.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
