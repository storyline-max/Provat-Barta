import React, { useState, useMemo } from 'react';
import { WeatherAlert } from '../types';
import {
  AlertTriangle,
  Flame,
  CloudRain,
  Snowflake,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Info,
  ExternalLink,
  PhoneCall,
  RotateCcw,
  Thermometer,
  CloudLightning,
} from 'lucide-react';
import {
  WeatherThresholdConfig,
  DEFAULT_THRESHOLDS,
  SimulationPreset,
  evaluateRegionalWeatherAlerts,
} from '../utils/weatherAlerts';
import { CITIES_7DAY_FORECAST } from '../data/mockWeatherForecast';

interface WeatherAlertSectionProps {
  onSelectCityInChart?: (cityId: string) => void;
  activeChartCityId?: string;
}

export const WeatherAlertSection: React.FC<WeatherAlertSectionProps> = ({
  onSelectCityInChart,
  activeChartCityId,
}) => {
  // Threshold settings state
  const [thresholds, setThresholds] = useState<WeatherThresholdConfig>(DEFAULT_THRESHOLDS);
  const [simulationPreset, setSimulationPreset] = useState<SimulationPreset>('none');
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);
  const [showFullBulletin, setShowFullBulletin] = useState<boolean>(false);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  // Dynamically compute regional alerts
  const allAlerts = useMemo(() => {
    return evaluateRegionalWeatherAlerts(CITIES_7DAY_FORECAST, thresholds, simulationPreset);
  }, [thresholds, simulationPreset]);

  // Filter out dismissed alerts
  const activeAlerts = useMemo(() => {
    return allAlerts.filter((a) => !dismissedAlertIds.includes(a.id));
  }, [allAlerts, dismissedAlertIds]);

  // Ensure active index is within bounds
  const currentAlert: WeatherAlert | undefined = activeAlerts[activeAlertIndex] || activeAlerts[0];

  const handleNextAlert = () => {
    if (activeAlerts.length <= 1) return;
    setActiveAlertIndex((prev) => (prev + 1) % activeAlerts.length);
  };

  const handlePrevAlert = () => {
    if (activeAlerts.length <= 1) return;
    setActiveAlertIndex((prev) => (prev - 1 + activeAlerts.length) % activeAlerts.length);
  };

  const handleResetDefaults = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setSimulationPreset('none');
    setDismissedAlertIds([]);
    setActiveAlertIndex(0);
  };

  // Helper for alert theme styling
  const getSeverityBadge = (severity: WeatherAlert['severity'], type: WeatherAlert['type']) => {
    if (severity === 'warning') {
      return {
        bg: 'bg-[#E5000C]',
        text: 'text-white',
        border: 'border-[#B30009]',
        icon: type === 'heat' ? Flame : type === 'freeze' ? Snowflake : AlertTriangle,
        label: 'WARNING • EXTREME THRESHOLD',
      };
    }
    if (severity === 'watch') {
      return {
        bg: 'bg-amber-600',
        text: 'text-white',
        border: 'border-amber-700',
        icon: type === 'heat' ? Flame : type === 'monsoon' ? CloudRain : AlertTriangle,
        label: 'WATCH • ELEVATED HAZARD',
      };
    }
    return {
      bg: 'bg-[#00204A]',
      text: 'text-white',
      border: 'border-[#00142E]',
      icon: Info,
      label: 'MET ADVISORY • WATCH LEVEL',
    };
  };

  const badgeConfig = currentAlert
    ? getSeverityBadge(currentAlert.severity, currentAlert.type)
    : null;
  const AlertIcon = badgeConfig?.icon || AlertTriangle;

  return (
    <div className="border border-stone-300 rounded-xs bg-[#fdfcf9] overflow-hidden my-3">
      {/* Top Banner Bar */}
      <div className="bg-[#00204A] text-white px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-dateline">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            {activeAlerts.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5000C] opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                activeAlerts.length > 0 ? 'bg-[#E5000C]' : 'bg-emerald-400'
              }`}
            ></span>
          </span>
          <span className="font-cinzel font-bold tracking-wider uppercase text-[11px]">
            Regional Weather Alert Service
          </span>
          <span className="text-stone-400 text-[10px] hidden sm:inline">|</span>
          <span className="text-[10px] text-stone-300">
            {activeAlerts.length > 0
              ? `${activeAlerts.length} Regional Advisory Threshold${
                  activeAlerts.length > 1 ? 's' : ''
                } Breached`
              : 'All Diaspora Hubs Nominal'}
          </span>
        </div>

        {/* Right Controls: Threshold Settings toggle & Alert pager */}
        <div className="flex items-center gap-2">
          {activeAlerts.length > 1 && (
            <div className="flex items-center gap-1 bg-[#001737] px-1.5 py-0.5 rounded text-[10px]">
              <button
                onClick={handlePrevAlert}
                className="hover:text-amber-400 p-0.5"
                title="Previous Regional Alert"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="font-bold px-1">
                {activeAlertIndex + 1}/{activeAlerts.length}
              </span>
              <button
                onClick={handleNextAlert}
                className="hover:text-amber-400 p-0.5"
                title="Next Regional Alert"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowConfigDrawer((v) => !v)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border transition-colors ${
              showConfigDrawer || simulationPreset !== 'none'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/20'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Thresholds {simulationPreset !== 'none' && '(Simulation Active)'}</span>
          </button>
        </div>
      </div>

      {/* Threshold Configuration & Simulation Drawer */}
      {showConfigDrawer && (
        <div className="bg-stone-100 border-b border-stone-300 p-3 text-xs font-dateline animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#00204A]" />
              Extreme Temperature & Weather Threshold Parameters
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-[10px] text-stone-500 hover:text-[#00204A] flex items-center gap-1 underline"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset to Factory Standards
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {/* Heat Threshold Selector */}
            <div className="bg-white p-2 border border-stone-200 rounded">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1 text-[#E5000C]">
                  <Flame className="w-3 h-3" /> Extreme Heat
                </span>
                <span>{thresholds.heatThresholdC}°C ({Math.round(thresholds.heatThresholdC * 1.8 + 32)}°F)</span>
              </div>
              <div className="flex gap-1">
                {[32, 34, 36, 38].map((val) => (
                  <button
                    key={val}
                    onClick={() => setThresholds((t) => ({ ...t, heatThresholdC: val }))}
                    className={`flex-1 py-0.5 text-[10px] rounded border font-semibold ${
                      thresholds.heatThresholdC === val
                        ? 'bg-[#E5000C] text-white border-[#B30009]'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                    }`}
                  >
                    {val}°C
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-stone-500 mt-1 leading-tight">
                Alert fires if current or forecast high meets or exceeds this temperature.
              </p>
            </div>

            {/* Rain / Monsoon Threshold */}
            <div className="bg-white p-2 border border-stone-200 rounded">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1 text-blue-700">
                  <CloudRain className="w-3 h-3" /> Heavy Precipitation
                </span>
                <span>{thresholds.rainThresholdPct}%</span>
              </div>
              <div className="flex gap-1">
                {[50, 65, 70, 80].map((val) => (
                  <button
                    key={val}
                    onClick={() => setThresholds((t) => ({ ...t, rainThresholdPct: val }))}
                    className={`flex-1 py-0.5 text-[10px] rounded border font-semibold ${
                      thresholds.rainThresholdPct === val
                        ? 'bg-blue-700 text-white border-blue-800'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-stone-500 mt-1 leading-tight">
                Alert fires when rain probability hits severe inundation levels.
              </p>
            </div>

            {/* Frost / Freeze Threshold */}
            <div className="bg-white p-2 border border-stone-200 rounded">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-1">
                <span className="flex items-center gap-1 text-[#00204A]">
                  <Snowflake className="w-3 h-3" /> Frost & Freeze
                </span>
                <span>{thresholds.coldThresholdC}°C ({Math.round(thresholds.coldThresholdC * 1.8 + 32)}°F)</span>
              </div>
              <div className="flex gap-1">
                {[-2, 0, 2, 4].map((val) => (
                  <button
                    key={val}
                    onClick={() => setThresholds((t) => ({ ...t, coldThresholdC: val }))}
                    className={`flex-1 py-0.5 text-[10px] rounded border font-semibold ${
                      thresholds.coldThresholdC === val
                        ? 'bg-[#00204A] text-white border-[#00142E]'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
                    }`}
                  >
                    {val}°C
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-stone-500 mt-1 leading-tight">
                Alert fires when temperature falls to or below freezing nadir.
              </p>
            </div>
          </div>

          {/* Test Simulation Scenarios */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-200 text-[10px]">
            <span className="font-bold text-stone-600">Simulate Extreme Weather Events:</span>
            <button
              onClick={() => setSimulationPreset('none')}
              className={`px-2 py-0.5 rounded border ${
                simulationPreset === 'none'
                  ? 'bg-stone-800 text-white font-bold border-stone-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              Current Live Data
            </button>
            <button
              onClick={() => setSimulationPreset('nyc_heatwave')}
              className={`px-2 py-0.5 rounded border flex items-center gap-1 ${
                simulationPreset === 'nyc_heatwave'
                  ? 'bg-[#E5000C] text-white font-bold border-[#B30009]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Flame className="w-2.5 h-2.5 text-amber-500" />
              NYC Heatwave (101°F / 38°C)
            </button>
            <button
              onClick={() => setSimulationPreset('london_freeze')}
              className={`px-2 py-0.5 rounded border flex items-center gap-1 ${
                simulationPreset === 'london_freeze'
                  ? 'bg-[#00204A] text-white font-bold border-[#00142E]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Snowflake className="w-2.5 h-2.5 text-blue-300" />
              London Sub-Zero Freeze (-4°C / 25°F)
            </button>
            <button
              onClick={() => setSimulationPreset('monsoon_surge')}
              className={`px-2 py-0.5 rounded border flex items-center gap-1 ${
                simulationPreset === 'monsoon_surge'
                  ? 'bg-blue-800 text-white font-bold border-blue-900'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <CloudRain className="w-2.5 h-2.5 text-blue-300" />
              Dhaka Torrential Cloudburst (95% Rain)
            </button>
          </div>
        </div>
      )}

      {/* Main Alert Content Body */}
      {currentAlert ? (
        <div className="p-3 sm:p-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
            {/* Left Column: Alert Icon, Badges & Headline */}
            <div className="flex-1">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {badgeConfig && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
                  >
                    <AlertIcon className="w-2.5 h-2.5" />
                    {badgeConfig.label}
                  </span>
                )}

                <span className="bg-stone-200 text-stone-800 font-bold px-2 py-0.5 rounded text-[10px] font-dateline uppercase">
                  Station: {currentAlert.cityName}, {currentAlert.country}
                </span>

                <span className="text-[10px] font-dateline text-stone-500">
                  {currentAlert.effectiveDate}
                </span>
              </div>

              {/* Headline */}
              <h4 className="font-headline font-bold text-base sm:text-lg text-stone-900 leading-snug mb-1">
                {currentAlert.headline}
              </h4>

              {/* Threshold condition note */}
              <div className="flex items-center gap-2 text-xs font-dateline text-stone-700 mb-2">
                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-bold text-[10px]">
                  {currentAlert.thresholdCrossed}
                </span>
                <span className="text-stone-600 font-medium">
                  {currentAlert.triggerCondition}
                </span>
              </div>

              {/* Description summary */}
              <p className="font-editorial text-xs text-stone-600 leading-relaxed max-w-3xl mb-2">
                {currentAlert.description}
              </p>

              {/* Precaution Action List */}
              <div className="bg-stone-50 border border-stone-200/80 rounded p-2 text-xs font-dateline text-stone-700">
                <span className="font-bold text-[#00204A] block mb-1 uppercase text-[10px] tracking-wider">
                  Mandatory Public Precautionary Protocol:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  {currentAlert.safetyAdvice.map((advice, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#E5000C] font-bold">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Actions & Quick Links */}
            <div className="md:w-60 shrink-0 flex flex-col justify-between gap-2 border-t md:border-t-0 md:border-l border-stone-200 pt-3 md:pt-0 md:pl-3">
              <div>
                <div className="text-[10px] font-dateline text-stone-500 uppercase tracking-wider mb-1">
                  Issuing Bureau
                </div>
                <div className="text-xs font-headline font-semibold text-stone-800 leading-tight mb-2">
                  {currentAlert.issuedBy}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-1.5 text-[10px] font-dateline text-amber-900 mb-2">
                  <strong>Urgency Status:</strong> {currentAlert.urgency} Action Required.
                </div>
              </div>

              <div className="space-y-1.5">
                {onSelectCityInChart && (
                  <button
                    onClick={() => onSelectCityInChart(currentAlert.cityId)}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#00204A] hover:bg-[#001737] text-white py-1.5 px-2.5 rounded text-xs font-dateline font-bold transition-colors shadow-2xs"
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Focus {currentAlert.cityName} in 7-Day Chart</span>
                  </button>
                )}

                <button
                  onClick={() => setShowFullBulletin(true)}
                  className="w-full flex items-center justify-center gap-1 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 py-1 px-2 rounded text-xs font-dateline transition-colors"
                >
                  <Info className="w-3 h-3 text-[#00204A]" />
                  <span>Read Full Met Bulletin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Nominal Clear State when no thresholds are hit */
        <div className="p-4 flex items-center justify-between gap-4 text-xs font-dateline bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-stone-900 text-sm">
                All Monitored Regional Hubs Operating Under Nominal Meteorological Conditions
              </h5>
              <p className="text-stone-600 text-xs">
                No temperatures or storm probabilities have breached active extreme thresholds (Heat: {thresholds.heatThresholdC}°C / {Math.round(thresholds.heatThresholdC * 1.8 + 32)}°F, Freeze: {thresholds.coldThresholdC}°C / {Math.round(thresholds.coldThresholdC * 1.8 + 32)}°F, Rain: {thresholds.rainThresholdPct}%).
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfigDrawer(true)}
            className="shrink-0 px-3 py-1 bg-white border border-stone-300 hover:bg-stone-50 rounded text-stone-700 font-semibold"
          >
            Adjust Threshold Sensitivity
          </button>
        </div>
      )}

      {/* Extended Full Meteorological Bulletin Modal */}
      {showFullBulletin && currentAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs no-print">
          <div className="bg-[#fbf9f4] border-2 border-[#00204A] rounded shadow-2xl max-w-xl w-full p-6 text-stone-900 font-editorial">
            <div className="border-b border-stone-300 pb-2 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#E5000C]" />
                <h3 className="font-cinzel font-bold text-sm uppercase text-[#00204A]">
                  Official Meteorological Bulletin & Precaution Guide
                </h3>
              </div>
              <button
                onClick={() => setShowFullBulletin(false)}
                className="text-stone-500 hover:text-stone-800 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-700">
              <div className="bg-stone-100 p-2.5 rounded border border-stone-200 font-dateline">
                <div className="text-stone-500 uppercase text-[10px]">Dispatch Reference:</div>
                <div className="font-bold text-stone-800">{currentAlert.headline}</div>
                <div className="text-stone-600 text-[11px] mt-0.5">
                  Authority: {currentAlert.issuedBy} • Window: {currentAlert.effectiveDate}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-stone-900 font-headline mb-1">
                  Threshold Criteria Analysis:
                </h5>
                <p>
                  Regional sensors recorded or projected <strong>{currentAlert.metricValue}</strong> in{' '}
                  {currentAlert.cityName}. This reading directly breached the established safety threshold ({currentAlert.thresholdCrossed}).
                </p>
              </div>

              <div>
                <h5 className="font-bold text-stone-900 font-headline mb-1">
                  Civilian Health & Safety Protocol:
                </h5>
                <ul className="list-disc pl-5 space-y-1">
                  {currentAlert.safetyAdvice.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-300 p-2.5 rounded flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-dateline">
                  <PhoneCall className="w-4 h-4 text-[#00204A]" />
                  <span>Emergency Disaster Management Hotline: <strong>1090</strong> (Toll Free)</span>
                </div>
                <span className="text-[10px] text-amber-800 font-bold">24/7 Operations</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowFullBulletin(false)}
                className="px-4 py-1.5 bg-[#00204A] text-white rounded font-dateline text-xs font-bold hover:bg-[#001737]"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
