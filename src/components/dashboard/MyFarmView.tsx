import React, { useEffect, useState } from 'react';
import {
  Check,
  Compass,
  Edit3,
  FlaskConical,
  MapPin,
  Plus,
  Sprout,
  Trash2,
} from 'lucide-react';
import { DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import { LeafletFarmMap } from '../LeafletFarmMap';
import { api } from '../../services/api';
import type { Farm, SoilProfile, SoilSourceType } from '../../types/agrolens';

interface MyFarmViewProps {
  farms: Farm[];
  activeFarm: Farm;
  soil: SoilProfile | null;
  onFarmUpdated: (farm: Farm, soil: SoilProfile | null) => void;
  onFarmCreated: (farm: Farm, soil: SoilProfile) => void;
  onFarmDeleted: (farmId: string) => void;
  onSelectFarm: (farmId: string) => void;
}

const OYO_LGAS = [
  'Akinyele',
  'Oyo East',
  'Oyo West',
  'Afijio',
  'Atiba',
  'Egbeda',
  'Ido',
  'Iseyin',
  'Ogbomoso North',
  'Saki West',
];

export function MyFarmView({
  farms,
  activeFarm,
  soil,
  onFarmUpdated,
  onFarmCreated,
  onFarmDeleted,
  onSelectFarm,
}: MyFarmViewProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [name, setName] = useState(activeFarm.name);
  const [sizeHectares, setSizeHectares] = useState(String(activeFarm.sizeHectares));
  const [state, setState] = useState(activeFarm.state);
  const [lga, setLga] = useState(activeFarm.lga);
  const [latitude, setLatitude] = useState(String(activeFarm.latitude));
  const [longitude, setLongitude] = useState(String(activeFarm.longitude));
  const [soilType, setSoilType] = useState(activeFarm.soilType);
  const [waterSource, setWaterSource] = useState(activeFarm.waterSource);
  const [currentCrop, setCurrentCrop] = useState(activeFarm.currentCrop);
  const [previousCropsText, setPreviousCropsText] = useState(activeFarm.previousCrops.join(', '));
  const [farmingPractice, setFarmingPractice] = useState(activeFarm.farmingPractice);

  // Soil Profile (missing values stay blank/null, never 0)
  const [soilSource, setSoilSource] = useState<SoilSourceType>(soil?.source ?? 'farmer_reported');
  const [labName, setLabName] = useState(soil?.labName ?? '');
  const [samplingDate, setSamplingDate] = useState(soil?.samplingDate ?? '');
  const [ph, setPh] = useState(soil?.ph !== null && soil?.ph !== undefined ? String(soil.ph) : '');
  const [om, setOm] = useState(
    soil?.organicMatterPercent !== null && soil?.organicMatterPercent !== undefined
      ? String(soil.organicMatterPercent)
      : ''
  );
  const [nitrogen, setNitrogen] = useState(
    soil?.nitrogenMgKg !== null && soil?.nitrogenMgKg !== undefined ? String(soil.nitrogenMgKg) : ''
  );
  const [phosphorus, setPhosphorus] = useState(
    soil?.phosphorusMgKg !== null && soil?.phosphorusMgKg !== undefined ? String(soil.phosphorusMgKg) : ''
  );
  const [potassium, setPotassium] = useState(
    soil?.potassiumMgKg !== null && soil?.potassiumMgKg !== undefined ? String(soil.potassiumMgKg) : ''
  );
  const [soilNotes, setSoilNotes] = useState(soil?.notes ?? '');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAddingNew) return;
    setName(activeFarm.name);
    setSizeHectares(String(activeFarm.sizeHectares));
    setState(activeFarm.state);
    setLga(activeFarm.lga);
    setLatitude(String(activeFarm.latitude));
    setLongitude(String(activeFarm.longitude));
    setSoilType(activeFarm.soilType);
    setWaterSource(activeFarm.waterSource);
    setCurrentCrop(activeFarm.currentCrop);
    setPreviousCropsText(activeFarm.previousCrops.join(', '));
    setFarmingPractice(activeFarm.farmingPractice);

    setSoilSource(soil?.source ?? 'farmer_reported');
    setLabName(soil?.labName ?? '');
    setSamplingDate(soil?.samplingDate ?? '');
    setPh(soil?.ph !== null && soil?.ph !== undefined ? String(soil.ph) : '');
    setOm(
      soil?.organicMatterPercent !== null && soil?.organicMatterPercent !== undefined
        ? String(soil.organicMatterPercent)
        : ''
    );
    setNitrogen(soil?.nitrogenMgKg !== null && soil?.nitrogenMgKg !== undefined ? String(soil.nitrogenMgKg) : '');
    setPhosphorus(
      soil?.phosphorusMgKg !== null && soil?.phosphorusMgKg !== undefined ? String(soil.phosphorusMgKg) : ''
    );
    setPotassium(soil?.potassiumMgKg !== null && soil?.potassiumMgKg !== undefined ? String(soil.potassiumMgKg) : '');
    setSoilNotes(soil?.notes ?? '');
  }, [activeFarm, soil, isAddingNew]);

  function startNewFarm() {
    setIsAddingNew(true);
    setName('');
    setSizeHectares('2.0');
    setState('Oyo State');
    setLga('Akinyele');
    setLatitude('7.5308');
    setLongitude('3.9125');
    setSoilType('Loamy Soil (Sandy Loam)');
    setWaterSource('Rainfed (Seasonal)');
    setCurrentCrop('Maize');
    setPreviousCropsText('Maize, Cowpea');
    setFarmingPractice('Mixed Rainfed Smallholder');
    setSoilSource('untested');
    setLabName('');
    setSamplingDate('');
    setPh('');
    setOm('');
    setNitrogen('');
    setPhosphorus('');
    setPotassium('');
    setSoilNotes('');
    setFeedback('');
    setError('');
  }

  function handleUseGeolocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(5));
        setLongitude(pos.coords.longitude.toFixed(5));
        setFeedback('Coordinates updated from browser GPS.');
      },
      () => {
        setError('Could not access GPS location. You can click directly on the map instead.');
      }
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');

    const parsedPrev = previousCropsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isAddingNew) {
        const created = await api.farms.create({
          name,
          sizeHectares: Number(sizeHectares),
          state,
          lga,
          latitude: Number(latitude),
          longitude: Number(longitude),
          soilType,
          waterSource,
          currentCrop,
          previousCrops: parsedPrev,
          farmingPractice,
        });
        const savedSoil = await api.soil.save(created.farm.id, {
          source: soilSource,
          labName: labName || null,
          samplingDate: samplingDate || null,
          soilTexture: soilType,
          ph: ph === '' ? null : Number(ph),
          organicMatterPercent: om === '' ? null : Number(om),
          nitrogenMgKg: nitrogen === '' ? null : Number(nitrogen),
          phosphorusMgKg: phosphorus === '' ? null : Number(phosphorus),
          potassiumMgKg: potassium === '' ? null : Number(potassium),
          notes: soilNotes,
        });
        setIsAddingNew(false);
        onFarmCreated(created.farm, savedSoil.soil);
        setFeedback('New farm registered and saved.');
      } else {
        const updatedFarm = await api.farms.update(activeFarm.id, {
          name,
          sizeHectares: Number(sizeHectares),
          state,
          lga,
          latitude: Number(latitude),
          longitude: Number(longitude),
          soilType,
          waterSource,
          currentCrop,
          previousCrops: parsedPrev,
          farmingPractice,
        });
        const savedSoil = await api.soil.save(activeFarm.id, {
          source: soilSource,
          labName: labName || null,
          samplingDate: samplingDate || null,
          soilTexture: soilType,
          ph: ph === '' ? null : Number(ph),
          organicMatterPercent: om === '' ? null : Number(om),
          nitrogenMgKg: nitrogen === '' ? null : Number(nitrogen),
          phosphorusMgKg: phosphorus === '' ? null : Number(phosphorus),
          potassiumMgKg: potassium === '' ? null : Number(potassium),
          notes: soilNotes,
        });
        onFarmUpdated(updatedFarm.farm, savedSoil.soil);
        setFeedback('Farm profile and soil provenance saved.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save farm profile.');
    } finally {
      setSaving(false);
    }
  }

  const parsedLat = Number(latitude) || activeFarm.latitude;
  const parsedLng = Number(longitude) || activeFarm.longitude;
  const parsedHa = Number(sizeHectares) || activeFarm.sizeHectares;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D]">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86EFAC]">
              <Sprout className="w-4 h-4" />
              Farm Registration &amp; Soil Provenance
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Manage Your Farm Profile</h1>
            <p className="text-sm text-[#DCFCE7]">
              Record coordinates, cropping history, and clearly sourced soil test measurements.
            </p>
          </div>
          <button
            type="button"
            onClick={startNewFarm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#0B4D1E] text-xs font-bold hover:bg-[#EAF6EB] transition-colors self-start md:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Another Farm
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E6EFE6] pb-3">
            <h2 className="font-display text-lg font-bold text-[#0F1F14]">
              {isAddingNew ? 'Register New Farm' : 'Edit Active Farm Profile'}
            </h2>
            {isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs font-semibold text-[#4B6352] hover:text-[#0F1F14] cursor-pointer"
              >
                Cancel New Farm
              </button>
            )}
          </div>

          {/* 1. Basic Farm Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B4D1E]">1. Basic Farm Information &amp; Coordinates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Farm Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Oyo Pilot Farm"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Farm Size (Hectares) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={sizeHectares}
                  onChange={(e) => setSizeHectares(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Local Government Area (LGA)</label>
                <select
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  {OYO_LGAS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  {!OYO_LGAS.includes(lga) && <option value={lga}>{lga}</option>}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] font-mono text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] font-mono text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <button
                type="button"
                onClick={handleUseGeolocation}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0B4D1E] text-white text-xs font-semibold hover:bg-[#146C2E] transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                Use My Location
              </button>
            </div>
          </div>

          {/* 2. Soil Information & Provenance */}
          <div className="space-y-4 pt-3 border-t border-[#E6EFE6]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#0B4D1E] flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4" />
                2. Soil Information &amp; Laboratory Provenance
              </h3>
              <span className="text-[11px] font-medium text-[#4B6352]">
                Leave unknown fields blank (never enter 0 for missing tests)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Soil Type / Texture</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  <option value="Loamy Soil (Sandy Loam)">Loamy Soil (Sandy Loam)</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                  <option value="Ferric Luvisol (Oyo Upland)">Ferric Luvisol (Oyo Upland)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Measurement Source *</label>
                <select
                  value={soilSource}
                  onChange={(e) => setSoilSource(e.target.value as SoilSourceType)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                >
                  <option value="laboratory_test">Verified Soil Laboratory Test</option>
                  <option value="farmer_reported">Farmer-Reported / Field Kit</option>
                  <option value="untested">Untested (No Soil Measurements Yet)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Soil pH (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="3.5"
                  max="9.0"
                  placeholder="Missing (e.g., 6.2)"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Organic Matter % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="15"
                  placeholder="Missing"
                  value={om}
                  onChange={(e) => setOm(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Sampling Date (Optional)</label>
                <input
                  type="date"
                  value={samplingDate}
                  onChange={(e) => setSamplingDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Lab / Kit Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., IITA Soil Lab Ibadan"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Nitrogen (mg/kg)</label>
                <input
                  type="number"
                  placeholder="Missing"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-sm tabular-nums"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Phosphorus (mg/kg)</label>
                <input
                  type="number"
                  placeholder="Missing"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-sm tabular-nums"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Potassium (mg/kg)</label>
                <input
                  type="number"
                  placeholder="Missing"
                  value={potassium}
                  onChange={(e) => setPotassium(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-sm tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* 3. Cropping History */}
          <div className="space-y-4 pt-3 border-t border-[#E6EFE6]">
            <h3 className="text-sm font-bold text-[#0B4D1E]">3. Cropping History &amp; Water Source</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Current Crop</label>
                <select
                  value={currentCrop}
                  onChange={(e) => setCurrentCrop(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white"
                >
                  <option value="Maize">Maize</option>
                  <option value="Cowpea">Cowpea</option>
                  <option value="Soybean">Soybean</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Previous Crops (comma separated)</label>
                <input
                  type="text"
                  value={previousCropsText}
                  onChange={(e) => setPreviousCropsText(e.target.value)}
                  placeholder="Maize, Cowpea"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Water Source</label>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white"
                >
                  <option value="Rainfed (Seasonal)">Rainfed (Seasonal)</option>
                  <option value="Supplemental Drip / Borehole">Supplemental Drip / Borehole</option>
                  <option value="Fadama / Lowland Moisture">Fadama / Lowland Moisture</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#233B2A]">Farming Practice</label>
                <select
                  value={farmingPractice}
                  onChange={(e) => setFarmingPractice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white"
                >
                  <option value="Mixed Rainfed Smallholder">Mixed Rainfed Smallholder</option>
                  <option value="Continuous Cereal">Continuous Cereal</option>
                  <option value="Conservation Tillage + Residue Retention">
                    Conservation Tillage + Residue Retention
                  </option>
                </select>
              </div>
            </div>
          </div>

          {feedback && (
            <p className="text-xs font-semibold text-[#15803D] bg-[#EAF6EB] border border-[#BBF7D0] rounded-lg px-3 py-2">
              {feedback}
            </p>
          )}
          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Saving...' : isAddingNew ? 'Register New Farm' : 'Save Farm Information'}
          </button>
        </form>

        {/* Right Interactive Map & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                <h2 className="font-display text-base font-bold text-[#0F1F14]">Farm Location &amp; Boundary</h2>
              </div>
              <span className="text-xs font-mono text-[#4B6352] tabular-nums">
                {parsedLat.toFixed(4)}°N, {parsedLng.toFixed(4)}°E
              </span>
            </div>

            <LeafletFarmMap
              latitude={parsedLat}
              longitude={parsedLng}
              farmName={name || 'New Farm'}
              boundary={isAddingNew ? undefined : activeFarm.boundary}
              editable
              heightClass="h-72"
              onCoordinateSelect={(lat, lng) => {
                setLatitude(String(lat));
                setLongitude(String(lng));
                setFeedback(`Map pin moved to ${lat}°N, ${lng}°E — click Save to persist.`);
              }}
            />

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#EDF6EE] rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-[#0B4D1E] tabular-nums">{parsedHa} ha</p>
                <p className="text-[11px] text-[#4B6352]">≈ {(parsedHa * 2.471).toFixed(1)} Acres</p>
              </div>
              <div className="bg-[#EDF6EE] rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-[#0B4D1E] tabular-nums">
                  {ph === '' ? 'Missing' : ph}
                </p>
                <p className="text-[11px] text-[#4B6352]">Soil pH</p>
              </div>
              <div className="bg-[#EDF6EE] rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-[#0B4D1E] tabular-nums">
                  {soil ? `${5 - soil.missingFields.length}/5` : '0/5'}
                </p>
                <p className="text-[11px] text-[#4B6352]">Soil Metrics</p>
              </div>
            </div>
          </section>

          {/* Soil Integrity Warning */}
          <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-2">
            <h3 className="font-display text-sm font-bold text-[#0F1F14]">Soil Data Provenance Standard</h3>
            <p className="text-xs text-[#4B6352] leading-relaxed">
              Soil pH, organic matter, and NPK values are sourced strictly from laboratory tests or farmer-reported
              field kits—never presented as NASA satellite measurements. Missing fields remain recorded as missing so
              analysis confidence reflects real data completeness.
            </p>
          </section>
        </div>
      </div>

      {/* Registered Farms Table */}
      <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-[#0F1F14]">My Registered Farms</h2>
          <span className="text-xs text-[#4B6352] tabular-nums">{farms.length} farm(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2EBE2] text-xs text-[#4B6352]">
                <th className="py-2.5 pr-4 font-semibold">Farm Name</th>
                <th className="py-2.5 pr-4 font-semibold">Location</th>
                <th className="py-2.5 pr-4 font-semibold">Coordinates</th>
                <th className="py-2.5 pr-4 font-semibold">Size</th>
                <th className="py-2.5 pr-4 font-semibold">Soil Type</th>
                <th className="py-2.5 pr-4 font-semibold">Status</th>
                <th className="py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF4EE]">
              {farms.map((f) => {
                const isSelected = f.id === activeFarm.id;
                return (
                  <tr key={f.id} className={isSelected ? 'bg-[#F4FAF4]' : 'hover:bg-[#FAFCFA]'}>
                    <td className="py-3 pr-4 font-semibold text-[#0F1F14]">
                      {f.name}
                      {f.isPilotDemo && (
                        <span className="ml-2 text-[11px] font-medium text-[#15803D]">(Pilot Demo)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-[#364F3D]">
                      {f.lga}, {f.state}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#4B6352] tabular-nums">
                      {f.latitude.toFixed(4)}°N, {f.longitude.toFixed(4)}°E
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{f.sizeHectares} ha</td>
                    <td className="py-3 pr-4 text-[#364F3D]">{f.soilType}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-[#15803D]">{f.status}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          onSelectFarm(f.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#CFE2D0] text-xs font-semibold text-[#0B4D1E] hover:bg-[#EAF6EB] cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                      {!f.isPilotDemo && (
                        <button
                          type="button"
                          onClick={async () => {
                            await api.farms.remove(f.id);
                            onFarmDeleted(f.id);
                          }}
                          className="inline-flex items-center p-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                          title="Delete farm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
