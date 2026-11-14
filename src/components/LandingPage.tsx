import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Leaf,
  LineChart,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  Sprout,
} from 'lucide-react';
import { AgroLensLogo, HeroFieldArtwork, SoilSproutArtwork } from './illustrations/AgroVisuals';
import { api } from '../services/api';

interface LandingPageProps {
  onNavigateAuth: (mode: 'signin' | 'signup') => void;
  onEnterDemo: () => void;
}

const FEATURES = [
  {
    icon: LineChart,
    title: 'Environmental Intelligence',
    description:
      'Retrieve historical rainfall, temperature, and soil wetness from NASA POWER, GPM IMERG, and SMAP with clear units and provenance.',
  },
  {
    icon: Sprout,
    title: 'Crop Intelligence',
    description:
      'Explore structured agronomic profiles for maize, cowpea, and soybean calibrated for Oyo State planting windows and soil tolerances.',
  },
  {
    icon: RefreshCw,
    title: 'Rotation Strategy Lab',
    description:
      'Compare continuous maize against legume rotations using transparent weighted criteria and separate evidence confidence scores.',
  },
  {
    icon: ShieldAlert,
    title: 'Field Risk Explorer',
    description:
      'Inspect interactive field boundaries alongside regional heat, moisture, and erosion overlays with honest spatial resolution context.',
  },
  {
    icon: FileText,
    title: 'Decision Reports',
    description:
      'Generate clear, printable PDF summaries and invite agricultural extension officers to review risks and missing soil tests.',
  },
];

const FAQS = [
  {
    q: 'What is AgroLens?',
    a: 'AgroLens is an agricultural decision-support platform created for the NASA Space Apps Challenge 2026 ("Field Shift: Adapting Farms with NASA Data"). It translates NASA Earth observation data, local soil records, crop science, and farmer priorities into clear crop-rotation comparisons—starting with a pilot focus in Oyo State, Nigeria.',
  },
  {
    q: 'Does AgroLens replace local agronomic advice or soil lab tests?',
    a: 'No. AgroLens supports farmer judgement and discussions with extension officers rather than dictating planting choices. Satellite grids cover larger regional cells (~11 km to ~55 km), so laboratory soil testing (pH, NPK, organic matter) and on-farm verification remain essential.',
  },
  {
    q: 'Which NASA datasets does AgroLens integrate?',
    a: 'The platform retrieves live daily meteorology and soil wetness parameters from NASA POWER (PRECTOTCORR, T2M, T2M_MAX, T2M_MIN, RH2M, solar irradiance, GWETTOP/GWETROOT) and documents complementary provenance from NASA GPM IMERG precipitation and SMAP surface soil moisture.',
  },
  {
    q: 'Can I use AgroLens on mobile or with missing soil test data?',
    a: 'Yes. The interface adapts cleanly to mobile and desktop screens. Missing soil laboratory values are stored explicitly as missing—never coerced to zero—and reduce only the Evidence Confidence rating so you always see what local measurements are still needed.',
  },
];

export function LandingPage({ onNavigateAuth, onEnterDemo }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactState, setContactState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactState('sending');
    setContactError('');
    try {
      await api.contact.send(contactForm);
      setContactState('sent');
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactState('error');
      setContactError(err instanceof Error ? err.message : 'Unable to send message.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F9F5] text-[#0F1F14]">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E2EBE2]">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          <a href="#top" className="shrink-0">
            <AgroLensLogo />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2F4735]">
            <a href="#top" className="hover:text-[#0B4D1E] transition-colors whitespace-nowrap shrink-0">
              Home
            </a>
            <a href="#about" className="hover:text-[#0B4D1E] transition-colors whitespace-nowrap shrink-0">
              About
            </a>
            <a href="#features" className="hover:text-[#0B4D1E] transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#faq" className="hover:text-[#0B4D1E] transition-colors whitespace-nowrap shrink-0">
              FAQ
            </a>
            <a href="#contact" className="hover:text-[#0B4D1E] transition-colors whitespace-nowrap shrink-0">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateAuth('signin')}
              className="text-sm font-semibold text-[#0B4D1E] hover:text-[#16A34A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => onNavigateAuth('signup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className="relative overflow-hidden bg-gradient-to-b from-[#EDF6EE] to-[#F6F9F5] border-b border-[#E2EBE2]">
        <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-sm font-semibold text-[#15803D] tracking-wide">
              NASA Space Apps Challenge 2026 · Oyo State Pilot
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#0F1F14] leading-[1.08] text-balance">
              Smarter Farming. Greater Yields.
            </h1>
            <p className="text-base sm:text-lg text-[#364F3D] leading-relaxed max-w-xl">
              AgroLens connects NASA Earth observation datasets with local soil records and crop science to help
              Nigerian farmers compare rotation strategies with transparent evidence, clear risks, and confidence
              indicators.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onEnterDemo}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors shadow-sm cursor-pointer"
              >
                Explore Oyo Pilot Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateAuth('signup')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white border border-[#C6DBC7] text-[#0B4D1E] text-sm font-semibold hover:bg-[#EDF5ED] transition-colors cursor-pointer"
              >
                Register Your Farm
              </button>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-[#4B6352]">
              <span>NASA POWER · GPM IMERG · SMAP</span>
              <span aria-hidden="true">·</span>
              <span>Maize · Cowpea · Soybean</span>
              <span aria-hidden="true">·</span>
              <span>Extension Officer Review Ready</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-[#CFE2D0] bg-white shadow-sm">
              <HeroFieldArtwork className="w-full h-auto block" />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#15803D]">Key Features</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F1F14] text-balance">
            Powerful Tools for Smarter Decisions
          </h2>
          <p className="text-[#4B6352]">
            Everything required to register a farm, inspect NASA environmental trends, and evaluate crop rotation
            strategies responsibly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <button
                key={feat.title}
                type="button"
                onClick={onEnterDemo}
                className="text-left bg-white border border-[#DFEBDF] rounded-xl p-6 hover:border-[#22C55E] hover:shadow-sm transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF6EB] text-[#15803D] flex items-center justify-center mb-4 group-hover:bg-[#0B4D1E] group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-base font-bold text-[#0F1F14] mb-2">{feat.title}</h3>
                  <p className="text-sm text-[#4B6352] leading-relaxed">{feat.description}</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                  Open module
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* About AgroLens */}
      <section id="about" className="bg-white border-y border-[#E2EBE2] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#EDF6EE] border border-[#CFE2D0] p-8 space-y-6">
              <SoilSproutArtwork className="w-48 h-auto mx-auto" />
              <div className="space-y-3 text-sm text-[#2F4735]">
                <div className="flex items-center justify-between border-b border-[#D5E6D6] pb-2.5">
                  <span className="font-medium">Pilot Region</span>
                  <span className="font-semibold text-[#0B4D1E]">Oyo State, Nigeria</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#D5E6D6] pb-2.5">
                  <span className="font-medium">Initial Crop Focus</span>
                  <span className="font-semibold text-[#0B4D1E]">Maize · Cowpea · Soybean</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Methodology</span>
                  <span className="font-mono text-xs font-semibold text-[#0B4D1E]">Weighted Multi-Criteria</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#15803D]">About AgroLens</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F1F14] text-balance">
              Built for Nigerian Farmers and Extension Officers
            </h2>
            <p className="text-[#364F3D] leading-relaxed">
              Changing rainfall onset, rising temperatures, and continuous cereal cultivation put pressure on smallholder
              soils. Rather than acting as another raw weather dashboard, AgroLens connects NASA Earth observation
              indicators with crop characteristics, farmer priorities, and honest uncertainty reporting.
            </p>
            <ul className="space-y-3 pt-1">
              {[
                'Transparent NASA data provenance with spatial resolution disclaimers',
                'Separate suitability scoring and evidence confidence (missing soil tests never become zero)',
                'Honest legume caveats: residue management and soil phosphorus determine net fertility gains',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#233B2A]">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <button
                type="button"
                onClick={onEnterDemo}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors cursor-pointer"
              >
                Inspect Oyo Pilot Farm
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-7xl mx-auto px-6 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#15803D]">FAQ</p>
          <h2 className="font-display text-3xl font-bold text-[#0F1F14]">Frequently Asked Questions</h2>
          <p className="text-[#4B6352] leading-relaxed">
            Clear answers on how AgroLens uses NASA Earth observation datasets, evaluates crop rotations, and handles
            local soil uncertainties.
          </p>
        </div>
        <div className="lg:col-span-7 space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="bg-white border border-[#DFEBDF] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-[#0F1F14] hover:bg-[#F6FAF6] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#4B6352] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div className="px-6 pb-5 text-sm text-[#4B6352] leading-relaxed">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-white border border-[#DFEBDF] rounded-2xl p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#15803D]">Contact Us</p>
            <h2 className="font-display text-3xl font-bold text-[#0F1F14]">Get in Touch</h2>
            <p className="text-sm text-[#4B6352] leading-relaxed">
              Collaborating as an agricultural extension officer, researcher, or pilot farmer in Oyo State? Send us a
              note.
            </p>
            <div className="space-y-3 pt-2 text-sm text-[#2F4735]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#16A34A]" />
                <span>hello@agrolens.ng</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#16A34A]" />
                <span>+234 801 234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                <span>Akinyele Pilot Zone, Oyo State, Nigeria</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="lg:col-span-7 bg-[#EDF6EE] rounded-xl p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-[#0F1F14]">Send a Message</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
              <input
                type="email"
                required
                placeholder="Your Email"
                value={contactForm.email}
                onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="Your Message"
              value={contactForm.message}
              onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-[#CFE2D0] text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
            {contactState === 'sent' && (
              <p className="text-sm font-medium text-[#15803D]">Message received. Thank you for reaching out.</p>
            )}
            {contactState === 'error' && <p className="text-sm font-medium text-red-700">{contactError}</p>}
            <button
              type="submit"
              disabled={contactState === 'sending'}
              className="w-full py-3 rounded-lg bg-[#0B4D1E] text-white text-sm font-semibold hover:bg-[#146C2E] transition-colors disabled:opacity-60 cursor-pointer"
            >
              {contactState === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B4D1E] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AgroLensLogo variant="light" />
            <span className="text-xs text-[#BBF7D0]">· Turning Earth Observations into Smarter Farming Decisions</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#DCFCE7]">
            <a href="#top" className="hover:underline">
              Home
            </a>
            <a href="#about" className="hover:underline">
              About
            </a>
            <a href="#features" className="hover:underline">
              Features
            </a>
            <a href="#faq" className="hover:underline">
              FAQ
            </a>
            <span className="text-[#86EFAC] flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5" />
              Oyo State Pilot 2026
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
