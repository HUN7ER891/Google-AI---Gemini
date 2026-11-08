import React from 'react';
import { Activity, RefreshCw, PlusCircle, ShieldAlert, Globe, Sliders } from 'lucide-react';
import { AQIStandard } from '../utils/aqiCalculations.ts';

interface HeaderProps {
  language: 'bs' | 'en';
  setLanguage: (lang: 'bs' | 'en') => void;
  aqiStandard: AQIStandard;
  setAqiStandard: (std: AQIStandard) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastRefreshTime: string;
  onOpenConnectModal: () => void;
  onOpenHealthModal: () => void;
  activeEpisodeSeverity?: 'normal' | 'yellow' | 'orange' | 'red';
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  aqiStandard,
  setAqiStandard,
  onRefresh,
  isRefreshing,
  lastRefreshTime,
  onOpenConnectModal,
  onOpenHealthModal,
  activeEpisodeSeverity = 'normal',
}) => {
  const isBs = language === 'bs';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-indigo-500/20 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/40">
                <Activity className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    <span>{isBs ? 'EkoZrak Sarajevo' : 'Sarajevo AirSense'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium tracking-normal">
                      BiH
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400">
                  {isBs
                    ? 'Prototip pregleda kvaliteta zraka • Modeli, heuristike i ručni unosi'
                    : 'Air-quality viewer prototype • Models, heuristics and manual entries'}
                </p>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={onOpenConnectModal}
                className="p-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 transition-colors"
                title={isBs ? 'Ručni unos senzora' : 'Manual sensor entry'}
                aria-label={isBs ? 'Ručni unos senzora' : 'Manual sensor entry'}
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
            {/* Standard selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs">
              <span className="px-2 py-1 text-slate-400 hidden sm:inline flex items-center gap-1">
                <Sliders className="w-3 h-3" />
                Index:
              </span>
              <button
                onClick={() => setAqiStandard('bosnian')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  aqiStandard === 'bosnian'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Eko Akcija / FHMZ BiH Standard"
              >
                Eko Akcija (BiH)
              </button>
              <button
                onClick={() => setAqiStandard('epa')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  aqiStandard === 'epa'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="US EPA Standard (US Embassy BAM-1020)"
              >
                US EPA
              </button>
              <button
                onClick={() => setAqiStandard('eaqi')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  aqiStandard === 'eaqi'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="European EAQI Standard"
              >
                EU EAQI
              </button>
            </div>

            {/* Health Advisory button */}
            <button
              onClick={onOpenHealthModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeEpisodeSeverity === 'red' || activeEpisodeSeverity === 'orange'
                  ? 'bg-rose-950/50 border-rose-600/60 text-rose-300 hover:bg-rose-900/50 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title={isBs ? 'Zdravstvene preporuke' : 'Health Advisories'}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBs ? 'Savjeti za zdravlje' : 'Health Advice'}</span>
            </button>

            {/* Connect Sensor button */}
            <button
              onClick={onOpenConnectModal}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-950 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isBs ? 'Izvori i ručni unos' : 'Sources & Manual Entry'}</span>
            </button>

            {/* Language toggle */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setLanguage('bs')}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  language === 'bs' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bosanski jezik"
              >
                BS
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  language === 'en' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English language"
              >
                EN
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              title={isBs ? `Posljednji pokušaj preuzimanja: ${lastRefreshTime}` : `Last fetch attempt: ${lastRefreshTime}`}
              aria-label={isBs ? 'Osvježi podatke' : 'Refresh data'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden xl:inline">{lastRefreshTime}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
