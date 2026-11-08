import React, { useState } from 'react';
import { StationData } from '../types/airQuality.ts';
import { forecastLabel } from '../utils/dataProvenance.ts';
import { calculateBosnianPM25AQI } from '../utils/aqiCalculations.ts';
import { Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface ForecastChartProps {
  station: StationData | null;
  language: 'bs' | 'en';
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ station, language }) => {
  const isBs = language === 'bs';
  const [selectedHourIndex, setSelectedHourIndex] = useState<number | null>(null);

  if (!station || !station.hourlyForecast || station.hourlyForecast.time.length === 0) {
    return null;
  }

  const { time, pm25, pm10, aqi } = station.hourlyForecast;
  const hoursToShow = Math.min(24, time.length);
  const slicedTimes = time.slice(0, hoursToShow);
  const slicedPM25 = pm25.slice(0, hoursToShow);
  const slicedPM10 = pm10.slice(0, hoursToShow);
  const slicedAQI = aqi.slice(0, hoursToShow);

  const maxPM = Math.max(...slicedPM25, ...slicedPM10, 80);

  const activeIndex = selectedHourIndex !== null ? selectedHourIndex : 0;
  const activeTime = slicedTimes[activeIndex] || '';
  const activePM25 = slicedPM25[activeIndex] || 0;
  const activePM10 = slicedPM10[activeIndex] || 0;
  const activeAQI = slicedAQI[activeIndex] || calculateBosnianPM25AQI(activePM25);

  const formattedTime = activeTime.includes('T')
    ? activeTime.split('T')[1].slice(0, 5)
    : activeTime;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{station.forecastProvenance === 'modelled' ? (isBs ? 'Satni prikaz modela' : 'Hourly Model View') : (isBs ? 'Ogledni satni niz' : 'Sample Hourly Series')}</span>
              <span className="text-xs text-slate-400 font-normal">({isBs ? station.nameBs : station.name})</span>
            </h3>
            <p className="text-xs text-slate-400">
              {forecastLabel(station, language)}
            </p>
          </div>
        </div>

        {/* Selected Hour Telemetry Badge */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isBs ? 'Vrijeme:' : 'Time:'} <strong className="text-white">{formattedTime}</strong></span>
          </div>
          <span className="text-slate-600">•</span>
          <div>
            <span className="text-slate-400">PM2.5: </span>
            <strong className="text-white">{activePM25} μg/m³</strong>
          </div>
          <span className="text-slate-600">•</span>
          <div>
            <span className="text-slate-400">AQI: </span>
            <strong className={activeAQI > 150 ? 'text-rose-400' : activeAQI > 100 ? 'text-orange-400' : 'text-emerald-400'}>
              {activeAQI}
            </strong>
          </div>
        </div>
      </div>

      {/* Interactive Bar/Line Chart */}
      <div className="mt-5">
        <div className="h-44 sm:h-52 w-full flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 relative">
          {/* WHO 24h Threshold line at 15 μg/m³ */}
          <div
            className="absolute inset-x-0 border-b border-dashed border-emerald-500/40 pointer-events-none z-10 flex items-center justify-between pr-2 text-[10px] text-emerald-400 font-mono"
            style={{ bottom: `${(15 / maxPM) * 100}%` }}
          >
            <span>WHO PM2.5 limit (15 μg/m³)</span>
          </div>

          {slicedPM25.map((val, idx) => {
            const heightPct = Math.min(100, (val / maxPM) * 100);
            const isHovered = selectedHourIndex === idx;
            const hourLabel = slicedTimes[idx]?.includes('T')
              ? slicedTimes[idx].split('T')[1].slice(0, 5)
              : slicedTimes[idx];

            const barColor =
              val > 90 ? '#ef4444' : val > 50 ? '#f97316' : val > 25 ? '#eab308' : '#10b981';

            return (
              <div
                key={idx}
                onMouseEnter={() => setSelectedHourIndex(idx)}
                className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all ${
                    isHovered ? 'brightness-125 ring-2 ring-white/50' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{
                    height: `${Math.max(6, heightPct)}%`,
                    backgroundColor: barColor,
                  }}
                />

                {/* Hour label under bar */}
                {idx % (hoursToShow > 16 ? 4 : 2) === 0 && (
                  <span className="text-[10px] text-slate-500 font-mono mt-1 transform -translate-x-1/2 left-1/2">
                    {hourLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Dobar (&lt;25)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Umjeren (26-50)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" />
              <span>Nezdrav za osjetljive (51-90)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Nezdrav (&gt;90)</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            {isBs ? 'Pređite mišem preko stubića za pregled sat po sat' : 'Hover over bars to inspect hourly values'}
          </span>
        </div>
      </div>
    </div>
  );
};
