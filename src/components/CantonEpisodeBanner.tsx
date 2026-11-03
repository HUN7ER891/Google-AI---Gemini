import React, { useState } from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, ChevronDown, ChevronUp, Bell, Info } from 'lucide-react';
import { EpisodeStatus } from '../utils/aqiCalculations.ts';

interface CantonEpisodeBannerProps {
  episodeStatus: EpisodeStatus;
  language: 'bs' | 'en';
  worstStationName?: string;
  maxAQI?: number;
  inversionActive?: boolean;
}

export const CantonEpisodeBanner: React.FC<CantonEpisodeBannerProps> = ({
  episodeStatus,
  language,
  worstStationName,
  maxAQI,
  inversionActive,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isBs = language === 'bs';

  const severityStyles = {
    normal: {
      bg: 'bg-emerald-950/40 border-emerald-800/50',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      glow: 'shadow-emerald-950/20',
    },
    yellow: {
      bg: 'bg-amber-950/40 border-amber-800/50',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      glow: 'shadow-amber-950/20',
    },
    orange: {
      bg: 'bg-orange-950/40 border-orange-800/50',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />,
      glow: 'shadow-orange-950/30',
    },
    red: {
      bg: 'bg-rose-950/50 border-rose-800/60',
      badge: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />,
      glow: 'shadow-rose-950/50',
    },
  }[episodeStatus.severity];

  const title = isBs ? episodeStatus.titleBs : episodeStatus.titleEn;
  const measures = isBs ? episodeStatus.measuresBs : episodeStatus.measuresEn;

  return (
    <div className={`border rounded-xl p-3 sm:p-4 mb-4 backdrop-blur-sm transition-all ${severityStyles.bg} ${severityStyles.glow} shadow-lg`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{severityStyles.icon}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${severityStyles.badge}`}>
                {title}
              </span>
              {inversionActive && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 font-medium">
                  {isBs ? 'Aktivna temperaturna inverzija' : 'Active Thermal Inversion'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {isBs
                ? `Plan interventnih mjera Vlade Kantona Sarajevo u slučajevima prekomjerne zagađenosti zraka.`
                : `Official Sarajevo Canton Government Emergency Air Pollution Action Plan.`}
              {worstStationName && maxAQI && (
                <span className="text-slate-400 ml-1">
                  {isBs ? 'Maksimalni indeks:' : 'Peak Index:'}{' '}
                  <strong className="text-white">{maxAQI}</strong> ({worstStationName}).
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 self-start md:self-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <Bell className="w-3.5 h-3.5 text-slate-400" />
          <span>{isBs ? 'Mjere i zabrane' : 'Active Measures & Bans'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-medium mb-2">
            <Info className="w-3.5 h-3.5 text-slate-300" />
            <span>
              {isBs
                ? 'Naredbe i preporuke Stručnog tijela za koordinaciju i nadzor KS:'
                : 'Mandates and advisories from Canton Sarajevo Environmental Committee:'}
            </span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
            {measures.map((m, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/50">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
