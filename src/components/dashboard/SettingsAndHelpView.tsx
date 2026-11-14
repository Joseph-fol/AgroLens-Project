import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Database, Globe, RefreshCw, Scale, ShieldCheck, User as UserIcon } from 'lucide-react';
import {
  API_ENDPOINTS,
  getApiEnvironmentMode,
  resolveApiBaseUrl,
  setApiEnvironmentMode,
  type ApiEnvironmentMode,
} from '../../config/env';
import { api } from '../../services/api';
import type { Farm, User } from '../../types/agrolens';

export function HelpAndMethodologyView() {
  return (
    <div className="space-y-6">
      <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-3">
        <h1 className="font-display text-2xl font-extrabold text-[#0F1F14]">
          AgroLens Methodology &amp; Scientific Integrity Guide
        </h1>
        <p className="text-sm text-[#364F3D] max-w-3xl leading-relaxed">
          AgroLens was designed for the NASA Space Apps Challenge 2026 (&ldquo;Field Shift: Adapting Farms with NASA
          Data&rdquo;) to support farmer judgement in Oyo State, Nigeria without overclaiming satellite precision or
          guarantees.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0B4D1E] flex items-center gap-2">
            <Database className="w-5 h-5" />
            NASA Earth Observation Datasets
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-[#364F3D]">
            <li>
              <strong>NASA POWER:</strong> Daily meteorology, precipitation (<span className="font-mono">PRECTOTCORR</span>
              ), temperature (<span className="font-mono">T2M</span>), and MERRA-2 soil wetness (
              <span className="font-mono">GWETTOP/GWETROOT</span>) at 0.5° × 0.625° (~55 km) resolution.
            </li>
            <li>
              <strong>NASA GPM IMERG:</strong> Multi-satellite precipitation context (~11 km grid) complementing daily
              station/reanalysis rainfall estimates.
            </li>
            <li>
              <strong>NASA SMAP:</strong> L-band radiometer surface soil moisture (0–5 cm depth, 9 km enhanced / 36 km
              native).
            </li>
          </ul>
        </section>

        <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0B4D1E] flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Rotation Scoring &amp; Missing Data Handling
          </h2>
          <p className="text-xs sm:text-sm text-[#364F3D] leading-relaxed">
            Candidate sequences are compared via <span className="font-mono">S_j = Σ(w_i × s_ij) / Σw_i</span> across
            soil health, water conservation, climate resilience, economic suitability, and erosion reduction.
          </p>
          <p className="text-xs sm:text-sm text-[#364F3D] leading-relaxed">
            <strong>Suitability vs. Confidence:</strong> Missing soil lab values (e.g. missing NPK or pH) are stored as{' '}
            <span className="font-mono">null</span>—never zero—and lower the Evidence Confidence percentage rather than
            distorting suitability scores.
          </p>
        </section>

        <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-3 md:col-span-2">
          <h2 className="font-display text-lg font-bold text-[#0B4D1E] flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Pilot Scope &amp; Responsible Claims
          </h2>
          <p className="text-xs sm:text-sm text-[#364F3D] leading-relaxed">
            This demonstration is bounded to a pilot farm context in Oyo State, Nigeria using Maize, Cowpea, and
            Soybean. Results are candidate scenarios for discussion with agricultural extension officers—not automated
            directives or guaranteed yield predictions.
          </p>
        </section>
      </div>
    </div>
  );
}

export function SettingsView({
  user,
  activeFarm,
  onSignOut,
}: {
  user: User;
  activeFarm: Farm;
  onSignOut: () => void;
}) {
  const [envMode, setEnvMode] = useState<ApiEnvironmentMode>(getApiEnvironmentMode);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const activeBaseUrl = resolveApiBaseUrl();

  function handleChangeEnv(mode: ApiEnvironmentMode) {
    setApiEnvironmentMode(mode);
    setEnvMode(mode);
    setHealthResult(null);
    setHealthError(null);
  }

  async function handleTestBackend() {
    setCheckingHealth(true);
    setHealthResult(null);
    setHealthError(null);
    try {
      const res = await api.health();
      setHealthResult(
        `Connected (${res.database.runtime || 'node'} · ${res.orm} · DB: ${res.database.dbName} · ${res.database.mode})`
      );
    } catch (err) {
      setHealthError(err instanceof Error ? err.message : 'Unable to reach selected backend');
    } finally {
      setCheckingHealth(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
        <h1 className="font-display text-2xl font-extrabold text-[#0F1F14] flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-[#15803D]" />
          Account &amp; Workspace Settings
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
          <div className="p-4 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF]">
            <p className="text-xs text-[#4B6352]">Full Name</p>
            <p className="font-bold text-[#0F1F14] mt-0.5">{user.fullName}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF]">
            <p className="text-xs text-[#4B6352]">Email</p>
            <p className="font-bold text-[#0F1F14] mt-0.5">{user.email}</p>
          </div>
          <div className="p-4 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF]">
            <p className="text-xs text-[#4B6352]">Role</p>
            <p className="font-bold text-[#0B4D1E] mt-0.5 capitalize">
              {user.role === 'extension_officer' ? 'Agricultural Extension Officer' : user.role}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F4F9F4] border border-[#DFEBDF]">
            <p className="text-xs text-[#4B6352]">Active Farm</p>
            <p className="font-bold text-[#0F1F14] mt-0.5">
              {activeFarm.name} ({activeFarm.city ? `${activeFarm.city}, ` : ''}{activeFarm.state})
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#EDF6EE] border border-[#CFE2D0] p-4 flex items-start gap-3 text-xs text-[#233B2A]">
          <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
          <span>
            Extension officer accounts can endorse analyses, flag agronomic risks, and request laboratory soil tests
            inside the Decision Reports module.
          </span>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onSignOut}
            className="px-5 py-2.5 rounded-lg border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
          >
            Sign Out of AgroLens
          </button>
        </div>
      </section>

      <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-[#0F1F14] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#15803D]" />
            API Environment Configuration
          </h2>
          <span className="font-mono text-xs text-[#0B4D1E] bg-[#EAF6EB] px-2.5 py-1 rounded-md">
            Active: {activeBaseUrl}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => handleChangeEnv('auto')}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              envMode === 'auto'
                ? 'border-[#16A34A] bg-[#F4FAF4]'
                : 'border-[#DFEBDF] hover:bg-[#FAFDF9]'
            }`}
          >
            <p className="font-bold text-[#0F1F14]">Auto-Detect</p>
            <p className="text-[#4B6352] mt-0.5">Local on localhost, Vercel in hosted builds</p>
          </button>
          <button
            type="button"
            onClick={() => handleChangeEnv('local')}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              envMode === 'local'
                ? 'border-[#16A34A] bg-[#F4FAF4]'
                : 'border-[#DFEBDF] hover:bg-[#FAFDF9]'
            }`}
          >
            <p className="font-bold text-[#0F1F14]">Local Express Server</p>
            <p className="font-mono text-[11px] text-[#4B6352] mt-0.5 truncate">{API_ENDPOINTS.localAbsolute}</p>
          </button>
          <button
            type="button"
            onClick={() => handleChangeEnv('production')}
            className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
              envMode === 'production'
                ? 'border-[#16A34A] bg-[#F4FAF4]'
                : 'border-[#DFEBDF] hover:bg-[#FAFDF9]'
            }`}
          >
            <p className="font-bold text-[#0F1F14]">Vercel Serverless</p>
            <p className="font-mono text-[11px] text-[#4B6352] mt-0.5 truncate">{API_ENDPOINTS.production}</p>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestBackend}
            disabled={checkingHealth}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B4D1E] text-white text-xs font-semibold hover:bg-[#146C2E] transition-colors cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
            {checkingHealth ? 'Checking Connection...' : 'Verify Backend Health'}
          </button>
          {healthResult && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
              <CheckCircle2 className="w-4 h-4" />
              {healthResult}
            </span>
          )}
          {healthError && <span className="text-xs font-semibold text-red-700">{healthError}</span>}
        </div>
      </section>
    </div>
  );
}

