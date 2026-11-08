import type { StationData } from '../types/airQuality.ts';

export function provenanceLabel(station: StationData, language: 'bs' | 'en'): string {
  const labels = {
    modelled: ['Open-Meteo / CAMS model', 'Open-Meteo / CAMS model'],
    heuristic: ['Model + lokalna heuristika', 'Model + local heuristic'],
    synthetic: ['Sintetički primjer — nije mjerenje', 'Synthetic example — not a measurement'],
    manual: ['Ručni unos + ogledne dopunske vrijednosti', 'Manual entry + sample supporting values'],
  };
  return labels[station.provenance ?? (station.isCustom ? 'manual' : 'synthetic')][language === 'bs' ? 0 : 1];
}

export function forecastLabel(station: StationData, language: 'bs' | 'en'): string {
  return station.forecastProvenance === 'modelled'
    ? (language === 'bs' ? 'Satne vrijednosti Open-Meteo / CAMS modela' : 'Hourly Open-Meteo / CAMS model values')
    : (language === 'bs' ? 'Sintetički ogledni niz — nije prognoza' : 'Synthetic sample series — not a forecast');
}
