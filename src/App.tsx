import React, { useCallback, useEffect, useState } from 'react';
import { AuthPages } from './components/AuthPages';
import { LandingPage } from './components/LandingPage';
import { CropIntelligenceView } from './components/dashboard/CropIntelligenceView';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DecisionReportsView } from './components/dashboard/DecisionReportsView';
import { EnvironmentalView } from './components/dashboard/EnvironmentalView';
import { FieldRiskView } from './components/dashboard/FieldRiskView';
import { MyFarmView } from './components/dashboard/MyFarmView';
import { OverviewView } from './components/dashboard/OverviewView';
import { RotationLabView } from './components/dashboard/RotationLabView';
import { HelpAndMethodologyView, SettingsView } from './components/dashboard/SettingsAndHelpView';
import { api, getStoredToken, setStoredToken } from './services/api';
import type {
  AnalysisRecord,
  ClimateObservationRecord,
  CropProfile,
  DashboardTab,
  ExtensionReview,
  FarmerPriorities,
  Farm,
  SoilProfile,
  User,
} from './types/agrolens';

const DEMO_GUEST_USER: User = {
  id: 'user-farmer-joseph',
  fullName: 'Olawale Joseph',
  email: 'joseph@agrolens.ng',
  state: 'Oyo State',
  lga: 'Akinyele',
  role: 'farmer',
  createdAt: new Date().toISOString(),
};

const DEFAULT_PRIORITIES: FarmerPriorities = {
  soilHealth: 35,
  waterConservation: 25,
  climateResilience: 15,
  economicSuitability: 15,
  erosionReduction: 10,
};

export default function App() {
  const [route, setRoute] = useState<'landing' | 'signin' | 'signup' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<string>('');
  const [soil, setSoil] = useState<SoilProfile | null>(null);
  const [crops, setCrops] = useState<CropProfile[]>([]);
  const [climate, setClimate] = useState<ClimateObservationRecord | null>(null);
  const [rangeDays, setRangeDays] = useState<number>(7);
  const [loadingClimate, setLoadingClimate] = useState(false);

  const [priorities, setPriorities] = useState<FarmerPriorities>(DEFAULT_PRIORITIES);
  const [analysis, setAnalysis] = useState<AnalysisRecord | null>(null);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [reviews, setReviews] = useState<ExtensionReview[]>([]);

  const activeFarm = farms.find((f) => f.id === activeFarmId) || farms[0] || null;

  const loadFarmWorkspaceData = useCallback(
    async (farmId: string, days: number) => {
      setLoadingClimate(true);
      try {
        const [farmDetail, climateRes, analysisRes] = await Promise.all([
          api.farms.get(farmId),
          api.climate.get(farmId, days),
          api.analyses.getLatestForFarm(farmId),
        ]);
        setSoil(farmDetail.soil);
        setClimate(climateRes.climate);
        setAnalysis(analysisRes.analysis);
        setPriorities(analysisRes.analysis.priorities);

        const revRes = await api.reviews.list(analysisRes.analysis.id);
        setReviews(revRes.reviews);
      } finally {
        setLoadingClimate(false);
      }
    },
    []
  );

  const bootstrapWorkspace = useCallback(async () => {
    const [farmsRes, cropsRes] = await Promise.all([api.farms.list(), api.crops.list()]);
    setFarms(farmsRes.farms);
    setCrops(cropsRes.crops);
    const firstId = farmsRes.farms[0]?.id;
    if (firstId) {
      setActiveFarmId(firstId);
      await loadFarmWorkspaceData(firstId, 7);
    }
  }, [loadFarmWorkspaceData]);

  // Restore session if JWT token exists
  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    api.auth
      .me()
      .then((res) => {
        setUser(res.user);
        setRoute('dashboard');
        return bootstrapWorkspace();
      })
      .catch(() => {
        setStoredToken(null);
      });
  }, [bootstrapWorkspace]);

  async function handleEnterDemo() {
    setUser(DEMO_GUEST_USER);
    setRoute('dashboard');
    setActiveTab('overview');
    await bootstrapWorkspace();
  }

  async function handleAuthenticated(loggedInUser: User) {
    setUser(loggedInUser);
    setRoute('dashboard');
    setActiveTab('overview');
    await bootstrapWorkspace();
  }

  function handleSignOut() {
    setStoredToken(null);
    setUser(null);
    setRoute('landing');
  }

  async function handleSelectFarm(farmId: string) {
    setActiveFarmId(farmId);
    await loadFarmWorkspaceData(farmId, rangeDays);
  }

  async function handleChangeRange(days: number) {
    setRangeDays(days);
    if (!activeFarm) return;
    setLoadingClimate(true);
    try {
      const res = await api.climate.get(activeFarm.id, days);
      setClimate(res.climate);
    } finally {
      setLoadingClimate(false);
    }
  }

  async function handleForceRefreshClimate() {
    if (!activeFarm) return;
    setLoadingClimate(true);
    try {
      const res = await api.climate.fetch(activeFarm.id, rangeDays, true);
      setClimate(res.climate);
    } finally {
      setLoadingClimate(false);
    }
  }

  async function handleRunAnalysis(nextPriorities: FarmerPriorities) {
    if (!activeFarm) return;
    setRunningAnalysis(true);
    try {
      const res = await api.analyses.run({
        farmId: activeFarm.id,
        priorities: nextPriorities,
        rangeDays,
      });
      setAnalysis(res.analysis);
      setClimate(res.climate);
      setSoil(res.soil);
      const revRes = await api.reviews.list(res.analysis.id);
      setReviews(revRes.reviews);
    } finally {
      setRunningAnalysis(false);
    }
  }

  if (route === 'landing') {
    return (
      <LandingPage
        onNavigateAuth={(mode) => setRoute(mode)}
        onEnterDemo={handleEnterDemo}
      />
    );
  }

  if (route === 'signin' || route === 'signup') {
    return (
      <AuthPages
        mode={route}
        onSwitchMode={(mode) => setRoute(mode)}
        onBackHome={() => setRoute('landing')}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  const activeUser = user || DEMO_GUEST_USER;

  if (!activeFarm) {
    return (
      <div className="min-h-screen bg-[#F4F8F4] flex items-center justify-center p-6">
        <div className="bg-white border border-[#CFE2D0] rounded-2xl p-8 text-center space-y-2 max-w-md">
          <p className="font-display text-lg font-bold text-[#0B4D1E]">Loading AgroLens Workspace...</p>
          <p className="text-xs text-[#4B6352]">
            Connecting to Oyo State Pilot Farm and retrieving NASA Earth observation indicators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={activeUser}
      farms={farms}
      activeFarm={activeFarm}
      soil={soil}
      climate={climate}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onSelectFarm={handleSelectFarm}
      onSignOut={handleSignOut}
    >
      {activeTab === 'overview' && (
        <OverviewView
          user={activeUser}
          farm={activeFarm}
          soil={soil}
          climate={climate}
          analysis={analysis}
          refreshingClimate={loadingClimate}
          onRefreshClimate={handleForceRefreshClimate}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'my-farm' && (
        <MyFarmView
          farms={farms}
          activeFarm={activeFarm}
          soil={soil}
          onSelectFarm={handleSelectFarm}
          onFarmUpdated={async (updatedFarm, updatedSoil) => {
            setFarms((prev) => prev.map((f) => (f.id === updatedFarm.id ? updatedFarm : f)));
            setSoil(updatedSoil);
            await handleRunAnalysis(priorities);
          }}
          onFarmCreated={async (createdFarm, createdSoil) => {
            setFarms((prev) => [...prev, createdFarm]);
            setActiveFarmId(createdFarm.id);
            setSoil(createdSoil);
            await loadFarmWorkspaceData(createdFarm.id, rangeDays);
          }}
          onFarmDeleted={async (deletedId) => {
            const remaining = farms.filter((f) => f.id !== deletedId);
            setFarms(remaining);
            if (remaining[0]) {
              setActiveFarmId(remaining[0].id);
              await loadFarmWorkspaceData(remaining[0].id, rangeDays);
            }
          }}
        />
      )}

      {activeTab === 'environmental' && (
        <EnvironmentalView
          farm={activeFarm}
          climate={climate}
          rangeDays={rangeDays}
          loading={loadingClimate}
          onChangeRange={handleChangeRange}
          onForceRefresh={handleForceRefreshClimate}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'crops' && <CropIntelligenceView crops={crops} onNavigateTab={setActiveTab} />}

      {activeTab === 'rotation-lab' && (
        <RotationLabView
          farm={activeFarm}
          analysis={analysis}
          priorities={priorities}
          running={runningAnalysis}
          onUpdatePriorities={setPriorities}
          onRunAnalysis={handleRunAnalysis}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'field-risk' && <FieldRiskView farm={activeFarm} soil={soil} climate={climate} />}

      {activeTab === 'reports' && (
        <DecisionReportsView
          user={activeUser}
          farm={activeFarm}
          soil={soil}
          climate={climate}
          analysis={analysis}
          reviews={reviews}
          onReviewAdded={(rev) => setReviews((prev) => [rev, ...prev])}
        />
      )}

      {activeTab === 'help' && <HelpAndMethodologyView />}

      {activeTab === 'settings' && (
        <SettingsView user={activeUser} activeFarm={activeFarm} onSignOut={handleSignOut} />
      )}
    </DashboardLayout>
  );
}
