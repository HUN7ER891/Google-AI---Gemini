import type { StationData } from '../types/airQuality.ts';
import type { AQIResult } from './aqiCalculations.ts';
import { provenanceLabel } from './dataProvenance.ts';

// Leaflet treats tooltip strings as HTML, including names entered by users.
function escapeHtml(value: unknown): string {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

export function buildStationTooltip(station: StationData, aqi: AQIResult, isBs: boolean): string {
  const stationName = escapeHtml(isBs ? station.nameBs : station.name);
  const categoryLabel = escapeHtml(isBs ? aqi.labelBs : aqi.labelEn);

  return `
    <div class="p-1">
      <div class="flex items-center justify-between gap-2 mb-1">
        <span class="font-bold text-white text-xs">${stationName}</span>
        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style="background-color: ${escapeHtml(aqi.color)}">
          AQI ${escapeHtml(aqi.aqi)}
        </span>
      </div>
      <div class="text-[11px] text-slate-300">
        <div>${categoryLabel} (${escapeHtml(aqi.dominantPollutant)})</div>
        <div class="text-slate-400 mt-0.5">PM2.5: ${escapeHtml(station.pollutants.pm25)} μg/m³ • ${escapeHtml(station.elevationM)}m n/v</div>
        <div class="text-slate-400 mt-1">${escapeHtml(provenanceLabel(station, isBs ? 'bs' : 'en'))}</div>
      </div>
    </div>
  `;
}
