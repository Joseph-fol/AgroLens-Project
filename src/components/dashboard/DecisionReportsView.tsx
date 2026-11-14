import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  MessageSquarePlus,
  Printer,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CropIconIllustration, DashboardBannerBackdrop } from '../illustrations/AgroVisuals';
import { api } from '../../services/api';
import type {
  AnalysisRecord,
  ClimateObservationRecord,
  ExtensionReview,
  Farm,
  SoilProfile,
  User,
} from '../../types/agrolens';

interface DecisionReportsViewProps {
  user: User;
  farm: Farm;
  soil: SoilProfile | null;
  climate: ClimateObservationRecord | null;
  analysis: AnalysisRecord | null;
  reviews: ExtensionReview[];
  onReviewAdded: (rev: ExtensionReview) => void;
}

export function DecisionReportsView({
  user,
  farm,
  soil,
  climate,
  analysis,
  reviews,
  onReviewAdded,
}: DecisionReportsViewProps) {
  const [reviewStatus, setReviewStatus] = useState<ExtensionReview['status']>('Reviewed - Endorsed');
  const [reviewComments, setReviewComments] = useState('');
  const [flaggedRiskText, setFlaggedRiskText] = useState('');
  const [missingInfoText, setMissingInfoText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const topStrategy =
    analysis?.strategies.find((s) => s.rotationPlanId === analysis.recommendedStrategyId) ||
    analysis?.strategies[0];

  const trendData = (climate?.observations.slice(-14) ?? []).map((o) => ({
    date: o.date.slice(5),
    rainfall: o.rainfallMm ?? 0,
    temp: o.tempMeanC ?? 0,
    moisture: o.surfaceSoilWetnessPct ?? 0,
  }));

  function handleDownloadPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 48;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(11, 77, 30);
    doc.text('AgroLens — Crop Rotation Decision Report', 42, y);

    y += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 90, 75);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Methodology: ${analysis?.methodologyVersion || 'agrolens-v1.0'}`,
      42,
      y
    );

    y += 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 31, 20);
    doc.text(`1. Farm Profile: ${farm.name}`, 42, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Location: ${farm.lga}, ${farm.state} (${farm.latitude.toFixed(4)}N, ${farm.longitude.toFixed(4)}E) | Area: ${farm.sizeHectares} ha`,
      42,
      y
    );
    y += 14;
    doc.text(`Soil Type: ${farm.soilType} | Current Crop: ${farm.currentCrop} | Practice: ${farm.farmingPractice}`, 42, y);
    y += 14;
    doc.text(
      `Soil Profile (${soil?.source.replace('_', ' ') || 'untested'}): pH=${soil?.ph ?? 'Missing'}, OM=${soil?.organicMatterPercent ?? 'Missing'}%, N=${soil?.nitrogenMgKg ?? 'Missing'}, P=${soil?.phosphorusMgKg ?? 'Missing'}`,
      42,
      y
    );

    y += 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. NASA Earth Observation Summary', 42, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (climate) {
      doc.text(
        `Window (${climate.rangeDays}d): ${climate.summary.totalRainfallMm} mm Rainfall | ${climate.summary.avgTempC} C Mean Temp | ${climate.summary.avgSoilMoisturePct}% Surface Wetness`,
        42,
        y
      );
      y += 14;
      doc.text(`Source: ${climate.provenance[0]?.datasetName} (${climate.provenance[0]?.spatialResolution})`, 42, y);
    }

    y += 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Candidate Rotation Strategy Comparison', 42, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const s of analysis?.strategies ?? []) {
      doc.text(
        `• ${s.code} (${s.sequence.join(' -> ')}): Suitability ${s.suitabilityScore}/100 | Confidence ${s.confidenceScore}% | ${s.badgeLabel}`,
        48,
        y
      );
      y += 14;
    }

    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. Data Limitations & Uncertainty', 42, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const lim of analysis?.dataLimitations ?? []) {
      const lines = doc.splitTextToSize(`• ${lim}`, 510);
      doc.text(lines, 46, y);
      y += lines.length * 12;
    }

    doc.save(`AgroLens-Report-${farm.name.replace(/\s+/g, '-')}.pdf`);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!analysis || !reviewComments.trim()) return;
    setSubmittingReview(true);
    setReviewFeedback('');
    try {
      const res = await api.reviews.create({
        analysisId: analysis.id,
        farmId: farm.id,
        status: reviewStatus,
        comments: reviewComments,
        flaggedRisks: flaggedRiskText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        missingInfoIdentified: missingInfoText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        reviewerName: user.fullName,
        reviewerRole: user.role === 'extension_officer' ? 'Agricultural Extension Officer' : 'Farm Collaborator',
      });
      onReviewAdded(res.review);
      setReviewComments('');
      setFlaggedRiskText('');
      setMissingInfoText('');
      setReviewFeedback('Extension review saved to analysis record.');
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="relative rounded-2xl overflow-hidden text-white border border-[#14532D] no-print">
        <DashboardBannerBackdrop className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86EFAC]">
              <FileText className="w-4 h-4" />
              Evidence Summary &amp; Extension Review
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Decision Reports</h1>
            <p className="text-sm text-[#DCFCE7]">
              Review your complete farm analysis, export a PDF summary, and collaborate with extension officers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-[#0B4D1E] text-xs font-bold hover:bg-[#EAF6EB] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#093A17]/80 border border-white/25 text-white text-xs font-semibold hover:bg-[#093A17] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print View
            </button>
          </div>
        </div>
      </section>

      {/* Report Summary + Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-6 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#0F1F14]">Report Summary</h2>
            <span className="text-xs text-[#4B6352] font-mono">
              {analysis ? new Date(analysis.createdAt).toLocaleDateString() : 'Today'}
            </span>
          </div>

          <div className="rounded-xl bg-[#F4F9F4] border border-[#DFEBDF] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold text-[#0F1F14]">{farm.name}</p>
              <span className="text-xs font-semibold text-[#15803D]">{farm.sizeHectares} ha</span>
            </div>
            <p className="text-xs text-[#4B6352]">
              {farm.lga}, {farm.state} · {farm.latitude.toFixed(4)}°N, {farm.longitude.toFixed(4)}°E · Soil:{' '}
              {farm.soilType}
            </p>
            <div className="pt-2 flex items-start gap-2 text-xs text-[#233B2A]">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <span>
                {topStrategy
                  ? `Top-ranked option under your current weights is ${topStrategy.code} (${topStrategy.sequence.join(
                      ' → '
                    )}) with Suitability ${topStrategy.suitabilityScore}/100 and Confidence ${topStrategy.confidenceScore}%.`
                  : 'Run an analysis in the Rotation Strategy Lab to populate recommendations.'}
              </span>
            </div>
          </div>

          <div className="text-xs text-[#4B6352] space-y-1">
            <p>
              <strong>Soil Provenance:</strong>{' '}
              {soil ? `${soil.source.replace('_', ' ')} (pH: ${soil.ph ?? 'Missing'}, N/P/K: ${soil.nitrogenMgKg ?? 'Missing'})` : 'Not recorded'}
            </p>
          </div>
        </section>

        <section className="lg:col-span-6 bg-white border border-[#DFEBDF] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-col items-center text-center space-y-2">
              <p className="text-sm font-bold text-[#0F1F14]">Overall Suitability Index</p>
              <div className="w-28 h-28 rounded-full border-8 border-[#16A34A] flex flex-col items-center justify-center">
                <span className="font-display text-3xl font-extrabold text-[#0F1F14] tabular-nums">
                  {analysis?.overallFarmHealthScore ?? '--'}%
                </span>
                <span className="text-[11px] font-semibold text-[#15803D]">Favorable</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <p className="font-bold text-[#0F1F14]">NASA Key Metrics ({climate?.rangeDays || 30}d)</p>
              <div className="flex justify-between border-b border-[#EEF4EE] pb-1.5">
                <span className="text-[#4B6352]">Cumulative Rainfall</span>
                <span className="font-bold text-[#0F1F14] tabular-nums">
                  {climate ? `${climate.summary.totalRainfallMm} mm` : '--'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#EEF4EE] pb-1.5">
                <span className="text-[#4B6352]">Mean Temperature</span>
                <span className="font-bold text-[#0F1F14] tabular-nums">
                  {climate ? `${climate.summary.avgTempC}°C` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4B6352]">Surface Soil Wetness</span>
                <span className="font-bold text-[#15803D] tabular-nums">
                  {climate ? `${climate.summary.avgSoilMoisturePct}%` : '--'}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Strategy Analysis + Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0F1F14]">Rotation Strategy Analysis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(analysis?.strategies ?? []).map((s) => (
              <div key={s.rotationPlanId} className="rounded-xl border border-[#DFEBDF] bg-[#FAFDF9] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B4D1E]">{s.code}</span>
                  <span className="font-semibold text-[#15803D]">{s.badgeLabel}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {s.sequence.map((crop, i) => (
                    <React.Fragment key={`${crop}-${i}`}>
                      <CropIconIllustration cropName={crop} className="w-8 h-8" />
                      {i < s.sequence.length - 1 && <span className="text-xs text-[#6B8271]">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-xs font-bold text-[#0F1F14]">{s.sequence.join(' → ')}</p>
                <div className="flex items-center justify-between text-xs text-[#4B6352] pt-1 border-t border-[#E6EFE6]">
                  <span>
                    Suitability: <strong className="text-[#0F1F14] tabular-nums">{s.suitabilityScore}/100</strong>
                  </span>
                  <span>
                    Confidence: <strong className="text-[#0B4D1E] tabular-nums">{s.confidenceScore}%</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0F1F14]">Environmental Trends (Recent 14d)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4B6352' }} />
                <YAxis tick={{ fontSize: 10, fill: '#4B6352' }} />
                <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#CFE2D0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="rainfall" name="Rain (mm)" stroke="#0284C7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#EA580C" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="moisture" name="Wetness (%)" stroke="#16A34A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Insights, Recommended Actions & Data Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-[#0F1F14] flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#16A34A]" />
            Key Insights
          </h3>
          <ul className="space-y-2 text-xs text-[#364F3D]">
            {(analysis?.keyInsights ?? []).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-[#0F1F14] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B4D1E]" />
            Recommended Actions
          </h3>
          <ul className="space-y-2 text-xs text-[#364F3D]">
            {(analysis?.recommendedActions ?? []).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[#0B4D1E] font-bold">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-[#DFEBDF] rounded-2xl p-5 space-y-3">
          <h3 className="font-display text-base font-bold text-[#B45309] flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Data Limitations &amp; Gaps
          </h3>
          <ul className="space-y-2 text-xs text-[#364F3D]">
            {(analysis?.dataLimitations ?? []).map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Agricultural Extension Review Module (Section 3.7) */}
      <section className="bg-white border border-[#DFEBDF] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6EFE6] pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0F1F14] flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-[#15803D]" />
              Agricultural Extension Officer Review
            </h2>
            <p className="text-xs text-[#4B6352]">
              Extension officers can inspect this analysis, flag local risks, identify missing soil data, and record
              review status.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0B4D1E]">{reviews.length} review(s) recorded</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form onSubmit={handleSubmitReview} className="lg:col-span-6 space-y-3 no-print">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#233B2A]">Review Decision Status</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as ExtensionReview['status'])}
                className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm bg-white"
              >
                <option value="Reviewed - Endorsed">Reviewed - Endorsed for Local Trial</option>
                <option value="Needs Field Verification">Needs Field Verification</option>
                <option value="Missing Soil Data Flagged">Missing Soil Data Flagged</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#233B2A]">Agronomic Review Comments *</label>
              <textarea
                required
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Add local context, variety recommendations, or seasonal guidance..."
                className="w-full px-3.5 py-2 rounded-lg border border-[#CFE2D0] text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={flaggedRiskText}
                onChange={(e) => setFlaggedRiskText(e.target.value)}
                placeholder="Flagged risks (comma separated)"
                className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-xs"
              />
              <input
                type="text"
                value={missingInfoText}
                onChange={(e) => setMissingInfoText(e.target.value)}
                placeholder="Missing info (e.g., Lab NPK)"
                className="w-full px-3 py-2 rounded-lg border border-[#CFE2D0] text-xs"
              />
            </div>

            {reviewFeedback && <p className="text-xs font-semibold text-[#15803D]">{reviewFeedback}</p>}

            <button
              type="submit"
              disabled={submittingReview || !analysis}
              className="px-5 py-2.5 rounded-lg bg-[#0B4D1E] text-white text-xs font-semibold hover:bg-[#146C2E] transition-colors cursor-pointer disabled:opacity-60"
            >
              {submittingReview ? 'Submitting Review...' : 'Submit Extension Review'}
            </button>
          </form>

          <div className="lg:col-span-6 space-y-3">
            {reviews.length === 0 ? (
              <div className="rounded-xl bg-[#F4F8F4] border border-[#DFEBDF] p-5 text-xs text-[#4B6352]">
                No extension officer reviews have been logged for this analysis yet. Use the form to record an extension
                review or share the PDF report during field visits.
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="rounded-xl bg-[#F4F9F4] border border-[#CFE2D0] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F1F14]">
                      {rev.reviewerName} · {rev.reviewerRole}
                    </span>
                    <span className="font-semibold text-[#15803D]">{rev.status}</span>
                  </div>
                  <p className="text-xs text-[#233B2A] leading-relaxed">{rev.comments}</p>
                  {rev.flaggedRisks.length > 0 && (
                    <p className="text-[11px] text-[#B45309]">
                      <strong>Flagged Risks:</strong> {rev.flaggedRisks.join(', ')}
                    </p>
                  )}
                  {rev.missingInfoIdentified.length > 0 && (
                    <p className="text-[11px] text-[#4B6352]">
                      <strong>Missing Info:</strong> {rev.missingInfoIdentified.join(', ')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
