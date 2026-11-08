import React from 'react';
import { StationData } from '../types/airQuality.ts';
import { calculateInversionDiagnostic } from '../utils/aqiCalculations.ts';
import { provenanceLabel } from '../utils/dataProvenance.ts';
import { Mountain, ArrowUp, Wind, CloudFog, Sparkles, Navigation, AlertCircle } from 'lucide-react';

interface InversionAnalyzerProps {
  valleyStation: StationData | null;
  mountainStation: StationData | null;
  language: 'bs' | 'en';
}

export const InversionAnalyzer: React.FC<InversionAnalyzerProps> = ({
  valleyStation,
  mountainStation,
  language,
}) => {
  const isBs = language === 'bs';

  const valleyTemp = valleyStation?.weather?.temperatureC ?? 2.0;
  const mountainTemp = mountainStation?.weather?.temperatureC ?? 5.5;
  const valleyWind = valleyStation?.weather?.windSpeedKmH ?? 2.5;

  const valleyPM25 = valleyStation?.pollutants?.pm25 ?? 75;
  const mountainPM25 = mountainStation?.pollutants?.pm25 ?? 8;

  const inversion = calculateInversionDiagnostic(valleyTemp, mountainTemp, valleyWind);
  const airCleannessPct = Math.max(0, Math.round(((valleyPM25 - mountainPM25) / Math.max(1, valleyPM25)) * 100));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <CloudFog className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>{isBs ? 'Analizator temperaturne inverzije i sarajevske kotline' : 'Sarajevo Basin Thermal Inversion Analyzer'}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                inversion.isInverted ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {inversion.isInverted
                  ? (isBs ? 'Heuristički signal inverzije' : 'Heuristic inversion signal')
                  : (isBs ? 'Bez signala u modelu' : 'No signal in model')}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isBs
                ? 'Ilustrativno poređenje modeliranih ili probnih vrijednosti za kotlinu i Trebević. Nije potvrđeno mjerenje inverzije.'
                : 'Illustrative valley/Trebević comparison using modelled or sample values. This is not a confirmed inversion measurement.'}
            </p>
          </div>
        </div>

        {/* Live Cable Car Recommendation Pill */}
        <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs text-purple-200">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>
            {isBs
              ? `Razlika prikazanog PM2.5: ${airCleannessPct}% (model / primjer)`
              : `Displayed PM2.5 difference: ${airCleannessPct}% (model / sample)`}
          </span>
        </div>
      </div>

      {/* Visual Topography Cross-Section Diagram */}
      <div className="my-5 relative bg-slate-950 rounded-xl p-4 sm:p-5 border border-slate-800 overflow-hidden">
        {/* Background elevation contour styling */}
        <div className="relative h-48 sm:h-56 w-full flex flex-col justify-between">
          {/* Elevation lines */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-800 text-[10px] text-slate-500 font-mono pl-1">
            1.200 m (Trebević Vidikovac)
          </div>
          <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-purple-500/30 text-[10px] text-purple-400 font-mono pl-1 flex items-center justify-between pr-2">
            <span>~750 m ({isBs ? 'Ilustrativna visina na dijagramu' : 'Illustrative diagram height'})</span>
            <span className="text-xs font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-600/40 text-purple-300">
              {inversion.isInverted ? (isBs ? 'Zarobljeno zagađenje ispod' : 'Trapped Smog Below') : (isBs ? 'Slobodna disperzija' : 'Open Dispersion')}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 border-b border-slate-800 text-[10px] text-slate-500 font-mono pl-1">
            500 m (Sarajevo dno kotline: Otoka / Vijećnica / Ilidža)
          </div>

          {/* Smog Layer Fill (Below 750m) */}
          {inversion.isInverted && (
            <div
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-rose-950/30 via-orange-950/20 to-purple-950/20 border-t-2 border-dashed border-orange-500/40 transition-all duration-700"
              style={{ height: '62%' }}
            >
              <div className="p-3 text-[11px] text-orange-200/90 font-medium flex items-center gap-1.5">
                <CloudFog className="w-4 h-4 text-orange-400 shrink-0 animate-pulse" />
                <span>
                  {isBs
                    ? 'Dijagram prikazuje pojednostavljen scenarij zadržavanja zagađenja.'
                    : 'This diagram illustrates a simplified pollution-trapping scenario.'}
                </span>
              </div>
            </div>
          )}

          {/* Valley Basin Floor Pin */}
          <div className="absolute bottom-3 left-6 sm:left-12 z-10">
            <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-xl shadow-lg max-w-[190px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {isBs ? 'Dno kotline (Otoka / Centar)' : 'Valley Basin (Otoka / Centar)'}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-black text-rose-400">{valleyPM25} μg/m³</span>
                <span className="text-xs text-slate-300 font-bold">{valleyTemp.toFixed(1)}°C</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Wind className="w-3 h-3 text-sky-400" />
                <span>{valleyWind} km/h • {valleyStation ? provenanceLabel(valleyStation, language) : (isBs ? 'Probni podaci' : 'Sample data')}</span>
              </div>
            </div>
          </div>

          {/* Cable car line SVG overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line
              x1="25%"
              y1="82%"
              x2="85%"
              y2="18%"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              opacity="0.75"
            />
            {/* Cable car cabin */}
            <circle cx="55%" cy="50%" r="5" fill="#f43f5e" />
          </svg>

          {/* Mountain Trebević Pin */}
          <div className="absolute top-4 right-6 sm:right-12 z-10">
            <div className="bg-slate-900/95 border border-purple-500/50 p-2.5 rounded-xl shadow-xl max-w-[200px]">
              <div className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-purple-400" />
                <span>Trebević Vidikovac (1.160 m)</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-black text-emerald-400">{mountainPM25} μg/m³</span>
                <span className="text-xs text-purple-200 font-bold">{mountainTemp.toFixed(1)}°C</span>
              </div>
              <div className="text-[10px] text-emerald-300 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{mountainStation ? provenanceLabel(mountainStation, language) : (isBs ? 'Probni podaci' : 'Sample data')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">
            {isBs ? 'Temperaturni gradijent (ΔT)' : 'Temperature Gradient (ΔT)'}
          </div>
          <div className="text-xl font-black text-white mt-1 flex items-baseline gap-2">
            <span>{inversion.tempDelta > 0 ? `+${inversion.tempDelta}` : inversion.tempDelta}°C</span>
            <span className="text-xs font-semibold text-slate-400">
              {inversion.isInverted
                ? (isBs ? '(Planina je toplija!)' : '(Mountain is warmer!)')
                : (isBs ? '(Planina je hladnija)' : '(Mountain is colder)')}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isBs
              ? 'Razlika temperature je ulaz u pojednostavljenu heuristiku aplikacije.'
              : 'The temperature difference is an input to the app’s simplified heuristic.'}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">
            {isBs ? 'Stepen stagnacije vjetra' : 'Wind Stagnation Risk'}
          </div>
          <div className="text-xl font-black text-white mt-1 flex items-baseline gap-2">
            <span>{valleyWind} km/h</span>
            <span className="text-xs font-semibold text-amber-400">
              {valleyWind < 4.0 ? (isBs ? 'Zatišje (Kritično)' : 'Calm (Critical)') : (isBs ? 'Strujanje' : 'Breeze')}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isBs
              ? 'Prikaz koristi modelirani ili probni vjetar, bez mjerenja lokalne disperzije.'
              : 'This view uses modelled or sample wind, without measuring local dispersion.'}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">
            {isBs ? 'Planiranje boravka vani' : 'Planning time outdoors'}
          </div>
          <div className="text-base font-bold text-purple-300 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{isBs ? 'Provjerite aktuelna mjerenja' : 'Check current observations'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isBs
              ? 'Nadmorska visina i ovaj dijagram ne garantuju čist zrak. Provjerite mjerenja, vrijeme i lokalne obavijesti prije odlaska.'
              : 'Elevation and this diagram do not guarantee clean air. Check observations, weather and local notices before travelling.'}
          </div>
        </div>
      </div>
    </div>
  );
};
