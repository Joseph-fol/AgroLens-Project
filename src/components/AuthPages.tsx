import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { AgroLensLogo, HeroFieldArtwork } from './illustrations/AgroVisuals';
import { api, setStoredToken } from '../services/api';
import type { User, UserRole } from '../types/agrolens';

interface AuthPagesProps {
  mode: 'signin' | 'signup';
  onSwitchMode: (mode: 'signin' | 'signup') => void;
  onBackHome: () => void;
  onAuthenticated: (user: User) => void;
}

const NIGERIA_STATES = [
  'Oyo State',
  'Ogun State',
  'Osun State',
  'Ondo State',
  'Ekiti State',
  'Lagos State',
  'Kwara State',
  'Kaduna State',
  'Kano State',
  'FCT Abuja',
];

export function AuthPages({ mode, onSwitchMode, onBackHome, onAuthenticated }: AuthPagesProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [statesList, setStatesList] = useState<string[]>(NIGERIA_STATES);
  const [lgasList, setLgasList] = useState<string[]>(['Akinyele', 'Oyo East', 'Iseyin']);

  // Sign In fields
  const [loginEmail, setLoginEmail] = useState('joseph@agrolens.ng');
  const [loginPassword, setLoginPassword] = useState('agrolens2026');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Oyo State');
  const [lga, setLga] = useState('Akinyele');
  const [role, setRole] = useState<UserRole>('farmer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    api.locations
      .getStates()
      .then((res) => setStatesList(res.states.map((s) => s.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.locations
      .getLgas(state)
      .then((res) => {
        const names = res.lgas.map((l) => l.name);
        setLgasList(names);
        if (names.length > 0 && !names.includes(lga)) {
          setLga(names[0]);
        }
      })
      .catch(() => {});
  }, [state]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPassword });
      setStoredToken(res.token);
      onAuthenticated(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickDemo(demoEmail: string) {
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.login({ email: demoEmail, password: 'agrolens2026' });
      setStoredToken(res.token);
      onAuthenticated(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.register({
        fullName,
        email,
        phone,
        state,
        lga,
        role,
        password,
      });
      setStoredToken(res.token);
      onAuthenticated(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F7F2] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E2EBE2] px-6 h-16 flex items-center justify-between gap-8">
        <button type="button" onClick={onBackHome} className="cursor-pointer">
          <AgroLensLogo />
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#364F3D] hover:text-[#0B4D1E] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode(mode === 'signin' ? 'signup' : 'signin')}
            className="px-4 py-2 rounded-lg border border-[#0B4D1E] text-sm font-semibold text-[#0B4D1E] hover:bg-[#EDF6EE] transition-colors cursor-pointer whitespace-nowrap"
          >
            {mode === 'signin' ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Agricultural Showcase */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
              {mode === 'signin' ? 'Welcome Back to AgroLens' : 'Grow Smarter with AgroLens'}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F1F14] text-balance">
              {mode === 'signin'
                ? 'Access your farm insights and crop rotation strategies.'
                : 'Combine NASA Earth observations with local farm intelligence.'}
            </h1>
            <p className="text-[#4B6352] leading-relaxed">
              Evaluate climate suitability, moisture trends, and rotation options for maize, cowpea, and soybean in Oyo
              State, Nigeria.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#CFE2D0] bg-white shadow-sm">
            <HeroFieldArtwork className="w-full h-56 object-cover" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#DFEBDF] rounded-xl p-4 space-y-1.5">
              <BarChart3 className="w-5 h-5 text-[#16A34A]" />
              <p className="text-sm font-bold text-[#0F1F14]">Track Farm Health</p>
              <p className="text-xs text-[#4B6352]">Historical NASA rainfall & soil wetness trends.</p>
            </div>
            <div className="bg-white border border-[#DFEBDF] rounded-xl p-4 space-y-1.5">
              <Leaf className="w-5 h-5 text-[#16A34A]" />
              <p className="text-sm font-bold text-[#0F1F14]">Plan Rotations</p>
              <p className="text-xs text-[#4B6352]">Compare legume sequences against baseline.</p>
            </div>
            <div className="bg-white border border-[#DFEBDF] rounded-xl p-4 space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
              <p className="text-sm font-bold text-[#0F1F14]">Honest Evidence</p>
              <p className="text-xs text-[#4B6352]">Clear risks, confidence & extension review.</p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-[#DFEBDF] rounded-2xl p-7 sm:p-9 shadow-sm max-w-lg mx-auto">
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-full bg-[#EAF6EB] text-[#15803D] flex items-center justify-center mx-auto">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[#0F1F14]">Sign In to AgroLens</h2>
                  <p className="text-sm text-[#4B6352]">Sign in to view your registered farms and analyses.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#233B2A]">Email Address or Phone Number</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6B8271] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="joseph@agrolens.ng"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#233B2A]">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B8271] absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#6B8271] hover:text-[#0F1F14] cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick Demo Pilot Access */}
                <div className="pt-2 border-t border-[#E6EFE6] space-y-2.5">
                  <p className="text-xs font-semibold text-[#4B6352] text-center">
                    Oyo State Pilot Demo Access (1-Click Sign In)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('joseph@agrolens.ng')}
                      className="px-3 py-2 rounded-lg border border-[#CFE2D0] bg-[#F6FAF6] text-xs font-semibold text-[#0B4D1E] hover:bg-[#EAF6EB] transition-colors cursor-pointer"
                    >
                      Farmer: Olawale Joseph
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('extension@agrolens.ng')}
                      className="px-3 py-2 rounded-lg border border-[#CFE2D0] bg-[#F6FAF6] text-xs font-semibold text-[#0B4D1E] hover:bg-[#EAF6EB] transition-colors cursor-pointer"
                    >
                      Extension: Dr. Adebayo
                    </button>
                  </div>
                </div>

                <p className="text-center text-xs text-[#4B6352]">
                  Do not have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchMode('signup')}
                    className="font-semibold text-[#0B4D1E] hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="text-center space-y-1">
                  <h2 className="font-display text-2xl font-bold text-[#0F1F14]">Create Your Account</h2>
                  <p className="text-sm text-[#4B6352]">Register as a farmer or agricultural extension officer.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#233B2A]">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#6B8271] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6B8271] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6B8271] absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 801 234 5678"
                        className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">State</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#6B8271] absolute left-3 top-3" />
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full pl-9 pr-2 py-2.5 rounded-lg border border-[#CFE2D0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                      >
                        {statesList.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">LGA</label>
                    <select
                      value={lga}
                      onChange={(e) => setLga(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#CFE2D0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    >
                      {lgasList.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#CFE2D0] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    >
                      <option value="farmer">Farmer</option>
                      <option value="extension_officer">Extension Officer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#233B2A]">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-[#4B6352]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchMode('signin')}
                    className="font-semibold text-[#0B4D1E] hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
