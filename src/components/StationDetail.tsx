import React from 'react';
import { StationData } from '../types/airQuality.ts';
import { getOverallAQI, AQIStandard } from '../utils/aqiCalculations.ts';
import {
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
  Building,
  Info,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';

interface StationDetailProps {
  station: StationData | null;
  aqiStandard: AQIStandard;
  language: 'bs' | 'en';
  onOpenConnectModal?: () => void;
}

export const StationDetail: React.FC<StationDetailProps> = ({
  station,
  aqiStandard,
  language,
}) => {
  const isBs = language === 'bs';

  if (!station) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <p>{isBs ? 'Odaberite stanicu na mapi ili listi za detaljan uvid.' : 'Select a station on the map or list for detailed telemetry.'}</p>
      </div>
    );
  }

  const aqiRes = getOverallAQI(station.pollutants, aqiStandard);
  const stationName = isBs ? station.nameBs : station.name;
  const isMountain = station.id === 'trebevic' || station.elevationM >= 1000;

  // WHO 24h Guidelines: PM2.5 = 15 μg/m³, PM10 = 45 μg/m³, NO2 = 25 μg/m³, SO2 = 40 μg/m³
  const whoPm25Ratio = (station.pollutants.pm25 / 15).toFixed(1);
  const whoPm10Ratio = (station.pollutants.pm10 / 45).toFixed(1);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Top Station Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {station.municipality}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
              {station.elevationM} m n/v
            </span>
            {isMountain && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-600/50">
                {isBs ? 'Planinski zrak' : 'Mountain Air'}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <span>{stationName}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{station.sourceName}</span>
            <span>•</span>
            <span>{isBs ? 'Ažurirano:' : 'Updated:'} {station.lastUpdated}</span>
          </div>
        </div>

        {/* Source link or badge */}
        <div className="flex items-center gap-2">
          {station.isCustom ? (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 font-semibold">
              {isBs ? 'Povezani korisnički IoT senzor' : 'Connected Custom IoT Node'}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 font-medium">
              GPS: {station.latitude.toFixed(3)}, {station.longitude.toFixed(3)}
            </span>
          )}
        </div>
      </div>

      {/* Main AQI Score & Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-5 items-stretch">
        {/* Left: Big AQI Gauge Card */}
        <div
          className="lg:col-span-5 rounded-xl p-5 border flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundColor: `${aqiRes.color}15`,
            borderColor: `${aqiRes.color}45`,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isBs ? 'Indeks kvaliteta zraka' : 'Air Quality Index'} ({aqiStandard.toUpperCase()})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl sm:text-6xl font-black text-white drop-shadow">
                  {aqiRes.aqi}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md text-white shadow-sm" style={{ backgroundColor: aqiRes.color }}>
                  {isBs ? aqiRes.labelBs : aqiRes.labelEn}
                </span>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
              style={{ backgroundColor: aqiRes.color }}
            >
              <Gauge className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs">
            <div className="text-slate-300 font-medium">
              {isBs ? aqiRes.descriptionBs : aqiRes.descriptionEn}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
              <span>{isBs ? 'Dominantna čestica:' : 'Dominant pollutant:'} <strong className="text-white">{aqiRes.dominantPollutant}</strong></span>
              {Number(whoPm25Ratio) > 1 && (
                <span className="text-rose-400 font-bold">{whoPm25Ratio}x {isBs ? 'preko WHO preporuke' : 'over WHO limit'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Weather & Valley Inversion Conditions */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
              <span>{isBs ? 'Lokalni meteorološki uslovi i ventilacija' : 'Local Meteorology & Ventilation'}</span>
              <span className="text-slate-500 font-mono">Open-Meteo / FHMZ</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Temperature */}
              <div className="bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-lg flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium truncate">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{isBs ? 'Temp.' : 'Temp.'}</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {station.weather.temperatureC.toFixed(1)}°C
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {isMountain ? (isBs ? 'Planina' : 'Mountain') : (isBs ? 'Kotlina' : 'Basin')}
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-lg flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium truncate">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{isBs ? 'Vlažnost' : 'Humidity'}</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {station.weather.humidityPct}%
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {station.weather.humidityPct > 80 ? (isBs ? 'Magle/Smog' : 'Smog cond.') : (isBs ? 'Umjereno' : 'Moderate')}
                </div>
              </div>

              {/* Wind Speed */}
              <div className="bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-lg flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium truncate">
                  <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{isBs ? 'Vjetar' : 'Wind'}</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {station.weather.windSpeedKmH.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {station.weather.windSpeedKmH < 4.0 ? (isBs ? 'Zatišje' : 'Stagnant') : (isBs ? 'Vjetrovito' : 'Breeze')}
                </div>
              </div>

              {/* Atmospheric Pressure */}
              <div className="bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-lg flex flex-col justify-between">
                <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium truncate">
                  <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{isBs ? 'Pritisak' : 'Pressure'}</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {Math.round(station.weather.surfacePressureHPa)} <span className="text-[10px] font-normal text-slate-400">hPa</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {station.weather.surfacePressureHPa > 980 ? (isBs ? 'Anticiklona' : 'High pressure') : (isBs ? 'Ciklona' : 'Low pressure')}
                </div>
              </div>
            </div>
          </div>

          {/* Quick guidance alert */}
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              {isMountain
                ? (isBs ? '🏔️ Trebević se nalazi iznad kape smoga. Čist planinski vazduh!' : '🏔️ Trebević sits above the valley smog cap. Pristine alpine air!')
                : (isBs ? '💡 Za bijeg od gradskog smoga preporučuje se Trebević (žičara) ili Igman/Bjelašnica.' : '💡 For smog escape, take the Sarajevo Cable Car to Trebević or head to Igman/Bjelašnica.')}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Pollutants Detailed Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{isBs ? 'Koncentracije zagađujućih materija' : 'Specific Pollutant Concentrations'}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({isBs ? 'poređenje sa graničnim vrijednostima WHO' : 'compared to WHO guidelines'})
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* PM2.5 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">PM2.5</span>
              <span className="text-[10px] font-mono text-slate-500">WHO: 15</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {station.pollutants.pm25} <span className="text-xs font-medium text-slate-400">μg/m³</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (station.pollutants.pm25 / 75) * 100)}%`,
                  backgroundColor: station.pollutants.pm25 > 50 ? '#ef4444' : station.pollutants.pm25 > 25 ? '#f97316' : '#10b981',
                }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isBs ? 'Lebdeće fine čestice' : 'Fine inhalable particles'}
            </div>
          </div>

          {/* PM10 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">PM10</span>
              <span className="text-[10px] font-mono text-slate-500">WHO: 45</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {station.pollutants.pm10} <span className="text-xs font-medium text-slate-400">μg/m³</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (station.pollutants.pm10 / 150) * 100)}%`,
                  backgroundColor: station.pollutants.pm10 > 100 ? '#ef4444' : station.pollutants.pm10 > 50 ? '#f97316' : '#10b981',
                }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isBs ? 'Grube čestice prašine' : 'Coarse particulate matter'}
            </div>
          </div>

          {/* NO2 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">NO₂</span>
              <span className="text-[10px] font-mono text-slate-500">WHO: 25</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {station.pollutants.no2 ?? '--'} <span className="text-xs font-medium text-slate-400">μg/m³</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${Math.min(100, ((station.pollutants.no2 ?? 0) / 100) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isBs ? 'Dušikov dioksid (saobraćaj)' : 'Nitrogen dioxide (traffic)'}
            </div>
          </div>

          {/* SO2 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">SO₂</span>
              <span className="text-[10px] font-mono text-slate-500">WHO: 40</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {station.pollutants.so2 ?? '--'} <span className="text-xs font-medium text-slate-400">μg/m³</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${Math.min(100, ((station.pollutants.so2 ?? 0) / 120) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isBs ? 'Sumpor-dioksid (ugalj/loženje)' : 'Sulphur dioxide (coal/heating)'}
            </div>
          </div>

          {/* CO */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">CO</span>
              <span className="text-[10px] font-mono text-slate-500">WHO: 4mg</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {station.pollutants.co ? (station.pollutants.co / 1000).toFixed(1) : '--'} <span className="text-xs font-medium text-slate-400">mg/m³</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${Math.min(100, ((station.pollutants.co ?? 0) / 3000) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isBs ? 'Ugljen-monoksid' : 'Carbon monoxide'}
            </div>
          </div>

          {/* O3 */}
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">O₃</span>
              <span className="text-[10px] font-mono text-slate-500">WHO: 100</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {station.pollutants.o3 ?? '--'} <span className="text-xs font-medium text-slate-400">μg/m³</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, ((station.pollutants.o3 ?? 0) / 120) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isBs ? 'Prizemni ozon' : 'Ground-level ozone'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
