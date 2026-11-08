import type { StationData, ExternalServiceConfig } from '../types/airQuality.ts';
import { calculateBosnianPM25AQI } from '../utils/aqiCalculations.ts';
import { readManualSensor } from '../utils/sensorInput.ts';

const CUSTOM_SENSORS_STORAGE_KEY = 'sarajevo_custom_sensors_v1';

export const INITIAL_SERVICES: ExternalServiceConfig[] = [
  {
    id: 'open_meteo',
    name: 'Copernicus & Open-Meteo Air Quality',
    provider: 'Copernicus Atmosphere Monitoring Service (CAMS)',
    status: 'configured',
    descriptionBs: 'Konfigurisano preuzimanje modeliranog zraka i vremena za 12 lokacija. Dio trenutnih vrijednosti aplikacija dodatno prilagođava heuristikom; ovo nisu direktna očitanja lokalnih stanica.',
    descriptionEn: 'Configured air-quality and weather model requests for 12 locations. Some current values receive additional app heuristics; these are not direct local station measurements.',
    websiteUrl: 'https://open-meteo.com/en/docs/air-quality-api',
  },
  {
    id: 'fhmz',
    name: 'FHMZ BiH (Federalni hidrometeorološki zavod)',
    provider: 'Vlada FBiH / Kanton Sarajevo',
    status: 'reference',
    descriptionBs: 'Službene referentne automatske stanice: Otoka, Ilidža, Vijećnica, Bjelave, Ilijaš, Vogošća.',
    descriptionEn: 'Official reference automated stations: Otoka, Ilidza, Vijecnica, Bjelave, Ilijas, Vogosca.',
    websiteUrl: 'https://www.fhmzbih.gov.ba',
  },
  {
    id: 'us_embassy',
    name: 'U.S. Embassy Sarajevo Air Quality Monitor',
    provider: 'US Department of State / AirNow',
    status: 'reference',
    descriptionBs: 'BAM-1020 kalibrisani referentni monitor čestica PM2.5 u ulici Zmaja od Bosne.',
    descriptionEn: 'Calibrated Met One BAM-1020 PM2.5 particulate monitor at Zmaja od Bosne.',
    websiteUrl: 'https://ba.usembassy.gov/air-quality-monitor/',
  },
  {
    id: 'eko_akcija',
    name: 'Eko Akcija Indeks Kvaliteta Zraka',
    provider: 'Udruženje građana Eko Akcija',
    status: 'reference',
    descriptionBs: 'Građanski agregator, upozorenja i indeks kvaliteta zraka za grad Sarajevo.',
    descriptionEn: 'Civic air quality index calculator, public health advisories, and aggregator.',
    websiteUrl: 'https://zrak.ekoakcija.org',
  },
  {
    id: 'sensor_community',
    name: 'Sensor.Community (Luftdaten Sarajevo)',
    provider: 'Open Citizen Science Network',
    status: 'reference',
    descriptionBs: 'Mreža otvorenih kućnih senzora građana (SDS011 / Nova Fitness) širom Sarajeva.',
    descriptionEn: 'Global open sensor network built and hosted by Sarajevo citizens (SDS011 / PMS5003).',
    websiteUrl: 'https://sensor.community',
  },
  {
    id: 'purple_air',
    name: 'PurpleAir Sarajevo Network',
    provider: 'PurpleAir Cloud Sensors',
    status: 'reference',
    descriptionBs: 'Laserski brojači čestica sa dva laserska kanala u realnom vremenu.',
    descriptionEn: 'Dual-laser optical particle counters with real-time cloud data feed.',
    websiteUrl: 'https://map.purpleair.com',
  },
];

export const BASELINE_STATIONS: Omit<StationData, 'pollutants' | 'weather' | 'lastUpdated'>[] = [
  {
    id: 'otoka',
    name: 'Sarajevo - Otoka',
    nameBs: 'Sarajevo - Otoka (Novi Grad / Novo Sarajevo)',
    municipality: 'Novi Grad',
    latitude: 43.8475,
    longitude: 18.3683,
    elevationM: 500,
    source: 'fhmz',
    sourceName: 'FHMZ BiH Referentna Stanica',
  },
  {
    id: 'vijecnica',
    name: 'Sarajevo - Vijećnica',
    nameBs: 'Sarajevo - Vijećnica (Stari Grad)',
    municipality: 'Stari Grad',
    latitude: 43.8590,
    longitude: 18.4334,
    elevationM: 538,
    source: 'fhmz',
    sourceName: 'FHMZ BiH Referentna Stanica',
  },
  {
    id: 'bjelave',
    name: 'Sarajevo - Bjelave Opservatorij',
    nameBs: 'Sarajevo - Bjelave Opservatorij (Centar)',
    municipality: 'Centar',
    latitude: 43.8667,
    longitude: 18.4194,
    elevationM: 630,
    source: 'fhmz',
    sourceName: 'FHMZ Meteorološki Opservatorij',
  },
  {
    id: 'us_embassy',
    name: 'U.S. Embassy Sarajevo',
    nameBs: 'Ambasada SAD u BiH (Zmaja od Bosne)',
    municipality: 'Novo Sarajevo',
    latitude: 43.8566,
    longitude: 18.3969,
    elevationM: 520,
    source: 'us_embassy',
    sourceName: 'US State Dept AirNow (BAM-1020)',
  },
  {
    id: 'ilidza',
    name: 'Ilidža - Terme',
    nameBs: 'Ilidža - Banjski Park / Centar',
    municipality: 'Ilidža',
    latitude: 43.8317,
    longitude: 18.3039,
    elevationM: 495,
    source: 'fhmz',
    sourceName: 'FHMZ BiH Referentna Stanica',
  },
  {
    id: 'vogosca',
    name: 'Vogošća - Jošanička',
    nameBs: 'Vogošća - Centar',
    municipality: 'Vogošća',
    latitude: 43.9022,
    longitude: 18.3436,
    elevationM: 510,
    source: 'fhmz',
    sourceName: 'FHMZ BiH / Općina Vogošća',
  },
  {
    id: 'ilijas',
    name: 'Ilijaš - Industrijska zona',
    nameBs: 'Ilijaš - Centar / Industrijska zona',
    municipality: 'Ilijaš',
    latitude: 43.9531,
    longitude: 18.2711,
    elevationM: 470,
    source: 'fhmz',
    sourceName: 'FHMZ BiH Referentna Stanica',
  },
  {
    id: 'hadzici',
    name: 'Hadžići - Igmanska',
    nameBs: 'Hadžići - Centar',
    municipality: 'Hadžići',
    latitude: 43.8228,
    longitude: 18.2192,
    elevationM: 560,
    source: 'fhmz',
    sourceName: 'Kanton Sarajevo Monitoring Mreža',
  },
  {
    id: 'trebevic',
    name: 'Trebević - Vidikovac (Planinska stanica)',
    nameBs: 'Trebević - Vidikovac / Žičara (1.160 m)',
    municipality: 'Trebević (Planina)',
    latitude: 43.8344,
    longitude: 18.4489,
    elevationM: 1160,
    source: 'open_meteo',
    sourceName: 'Planinska referentna stanica za inverziju',
  },
  {
    id: 'citizen_grbavica',
    name: 'Grbavica - Citizen Sensor #1',
    nameBs: 'Grbavica II - Građanski senzor (Sensor.Community)',
    municipality: 'Novo Sarajevo',
    latitude: 43.8510,
    longitude: 18.3910,
    elevationM: 515,
    source: 'sensor_community',
    sourceName: 'Sensor.Community DIY Node #54210',
  },
  {
    id: 'citizen_dobrinja',
    name: 'Dobrinja - AirSense Node',
    nameBs: 'Dobrinja IV - Bulevar M. Brkića (Sensor.Community)',
    municipality: 'Novi Grad',
    latitude: 43.8290,
    longitude: 18.3540,
    elevationM: 505,
    source: 'sensor_community',
    sourceName: 'Sensor.Community Node #38192',
  },
  {
    id: 'citizen_breka',
    name: 'Breka - Hillside Monitor',
    nameBs: 'Breka - Bolnička / Višnjik (PurpleAir)',
    municipality: 'Centar',
    latitude: 43.8710,
    longitude: 18.4110,
    elevationM: 670,
    source: 'purple_air',
    sourceName: 'PurpleAir PA-II Dual Laser',
  },
];

export function getCustomSensors(): StationData[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SENSORS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(readManualSensor).filter((s): s is StationData => s !== null) : [];
  } catch (err) {
    console.error('Failed to parse custom sensors from localStorage:', err);
    return [];
  }
}

export function saveCustomSensor(sensor: StationData): void {
  const validated = readManualSensor(sensor);
  if (!validated) throw new Error('Invalid manual sensor configuration');
  const existing = getCustomSensors();
  const index = existing.findIndex((s) => s.id === sensor.id);
  let updated: StationData[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = validated;
  } else {
    updated = [...existing, validated];
  }
  localStorage.setItem(CUSTOM_SENSORS_STORAGE_KEY, JSON.stringify(updated));
}

export function removeCustomSensor(sensorId: string): void {
  const existing = getCustomSensors();
  const updated = existing.filter((s) => s.id !== sensorId);
  localStorage.setItem(CUSTOM_SENSORS_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Fetches modelled data for configured coordinates, preserving the prototype's labelled heuristics.
 */
export async function fetchLiveSarajevoTelemetry(): Promise<StationData[]> {
  const customSensors = getCustomSensors();
  const allStationsMetadata = [...BASELINE_STATIONS];

  // Prepare batch coordinates for Open-Meteo
  const lats = allStationsMetadata.map((s) => s.latitude.toFixed(4)).join(',');
  const lons = allStationsMetadata.map((s) => s.longitude.toFixed(4)).join(',');

  try {
    // 1. Fetch Air Quality batch
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5,european_aqi,us_aqi&forecast_days=3&timezone=auto`;
    // 2. Fetch Weather & Temperature batch (needed for basin inversion)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;

    const [aqiRes, weatherRes] = await Promise.all([
      fetch(aqiUrl),
      fetch(weatherUrl),
    ]);

    if (!aqiRes.ok || !weatherRes.ok) {
      throw new Error(`Open-Meteo API returned error: AQI=${aqiRes.status}, Weather=${weatherRes.status}`);
    }

    const aqiDataRaw = await aqiRes.json();
    const weatherDataRaw = await weatherRes.json();

    const aqiList = Array.isArray(aqiDataRaw) ? aqiDataRaw : [aqiDataRaw];
    const weatherList = Array.isArray(weatherDataRaw) ? weatherDataRaw : [weatherDataRaw];
    if (aqiList.length !== allStationsMetadata.length || weatherList.length !== allStationsMetadata.length) {
      throw new Error('Incomplete Open-Meteo location batch');
    }

    const mappedStations: StationData[] = allStationsMetadata.map((meta, i) => {
      const aqiItem = aqiList[i] || {};
      const weatherItem = weatherList[i] || {};
      const currentAQI = aqiItem.current || {};
      const currentWeather = weatherItem.current || {};
      const hourly = aqiItem.hourly || {};
      const airValues = ['pm2_5', 'pm10', 'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide', 'ozone'];
      const weatherValues = ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m', 'wind_direction_10m', 'surface_pressure'];
      if (!airValues.every(key => typeof currentAQI[key] === 'number' && Number.isFinite(currentAQI[key]) && currentAQI[key] >= 0) ||
          !weatherValues.every(key => typeof currentWeather[key] === 'number' && Number.isFinite(currentWeather[key]))) {
        throw new Error('Invalid or incomplete Open-Meteo current values');
      }

      // Owner's prototype heuristics are preserved and labelled; these are not verified local measurements.
      let pm25 = Number(currentAQI.pm2_5 ?? 15);
      let pm10 = Number(currentAQI.pm10 ?? 25);
      let no2 = Number(currentAQI.nitrogen_dioxide ?? 20);
      let so2 = Number(currentAQI.sulphur_dioxide ?? 10);
      let co = Number(currentAQI.carbon_monoxide ?? 450);
      let o3 = Number(currentAQI.ozone ?? 30);

      // Trebević mountain station adjustment if model smoothing bleeds valley pollution up the 1160m peak
      if (meta.id === 'trebevic') {
        pm25 = Math.max(3, Math.round(pm25 * 0.28));
        pm10 = Math.max(5, Math.round(pm10 * 0.3));
        no2 = Math.max(2, Math.round(no2 * 0.2));
      } else if (meta.id === 'otoka' || meta.id === 'us_embassy') {
        // Otoka and US Embassy sit right in the center basin floor
        pm25 = Math.round(pm25 * 1.15);
        pm10 = Math.round(pm10 * 1.12);
      } else if (meta.id === 'ilijas') {
        so2 = Math.round(so2 * 1.6);
      }

      // Format hourly timeline (take next 48-72 hours)
      const hourlyTimes: string[] = hourly.time || [];
      const hourlyPM25: number[] = hourly.pm2_5 || [];
      const hourlyPM10: number[] = hourly.pm10 || [];
      if (!Array.isArray(hourlyTimes) || !Array.isArray(hourlyPM25) || !Array.isArray(hourlyPM10) ||
          !hourlyTimes.every(time => typeof time === 'string') ||
          hourlyTimes.length !== hourlyPM25.length || hourlyTimes.length !== hourlyPM10.length ||
          ![...hourlyPM25, ...hourlyPM10].every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0)) {
        throw new Error('Invalid Open-Meteo hourly values');
      }
      const hourlyAQI: number[] = hourlyPM25.map((val) => calculateBosnianPM25AQI(val));

      return {
        id: meta.id,
        name: meta.name,
        nameBs: meta.nameBs,
        municipality: meta.municipality,
        latitude: meta.latitude,
        longitude: meta.longitude,
        elevationM: meta.elevationM,
        source: meta.source,
        sourceName: meta.sourceName,
        provenance: ['trebevic', 'otoka', 'us_embassy', 'ilijas'].includes(meta.id) ? 'heuristic' : 'modelled',
        forecastProvenance: 'modelled',
        lastUpdated: typeof currentAQI.time === 'string' ? currentAQI.time : '—',
        pollutants: {
          pm25,
          pm10,
          no2,
          so2,
          co,
          o3,
        },
        weather: {
          temperatureC: Number(currentWeather.temperature_2m ?? 6.0),
          humidityPct: Number(currentWeather.relative_humidity_2m ?? 75),
          windSpeedKmH: Number(currentWeather.wind_speed_10m ?? 4.2),
          windDirectionDeg: Number(currentWeather.wind_direction_10m ?? 180),
          surfacePressureHPa: Number(currentWeather.surface_pressure ?? 950),
        },
        hourlyForecast: {
          time: hourlyTimes.slice(0, 48),
          pm25: hourlyPM25.slice(0, 48),
          pm10: hourlyPM10.slice(0, 48),
          aqi: hourlyAQI.slice(0, 48),
        },
      };
    });

    // Manual entries retain their saved time: a model refresh does not contact their endpoints.
    return [...mappedStations, ...customSensors];
  } catch (error) {
    console.warn('Network fetch error or offline fallback, generating telemetry for Sarajevo stations:', error);
    return getFallbackSarajevoTelemetry();
  }
}

/**
 * Synthetic fallback examples, not observations or a current pollution assessment.
 */
export function getFallbackSarajevoTelemetry(): StationData[] {
  const customSensors = getCustomSensors();

  const fallbackStations: StationData[] = BASELINE_STATIONS.map((meta) => {
    const isMountain = meta.id === 'trebevic';
    const isIndustrial = meta.id === 'ilijas';
    const isTrafficSpine = meta.id === 'otoka' || meta.id === 'us_embassy';

    const basePM25 = isMountain ? 6 : isIndustrial ? 95 : isTrafficSpine ? 84 : 68;
    const basePM10 = isMountain ? 10 : isIndustrial ? 140 : isTrafficSpine ? 112 : 90;

    return {
      id: meta.id,
      name: meta.name,
      nameBs: meta.nameBs,
      municipality: meta.municipality,
      latitude: meta.latitude,
      longitude: meta.longitude,
      elevationM: meta.elevationM,
      source: meta.source,
      sourceName: meta.sourceName,
      lastUpdated: '—',
      provenance: 'synthetic',
      forecastProvenance: 'synthetic',
      pollutants: {
        pm25: basePM25,
        pm10: basePM10,
        no2: isMountain ? 4 : isTrafficSpine ? 48 : 28,
        so2: isMountain ? 2 : isIndustrial ? 74 : 22,
        co: isMountain ? 180 : 750,
        o3: isMountain ? 42 : 18,
      },
      weather: {
        temperatureC: isMountain ? 5.2 : 1.8, // Inversion: mountain is warmer than basin!
        humidityPct: isMountain ? 45 : 88,
        windSpeedKmH: isMountain ? 14.5 : 2.1,
        windDirectionDeg: 140,
        surfacePressureHPa: isMountain ? 880 : 962,
      },
      hourlyForecast: {
        time: Array.from({ length: 24 }).map((_, i) => `${i}:00`),
        pm25: Array.from({ length: 24 }).map((_, i) => Math.max(5, Math.round(basePM25 * (0.8 + 0.4 * Math.sin(i / 3))))),
        pm10: Array.from({ length: 24 }).map((_, i) => Math.max(10, Math.round(basePM10 * (0.8 + 0.4 * Math.sin(i / 3))))),
        aqi: Array.from({ length: 24 }).map((_, i) => calculateBosnianPM25AQI(Math.round(basePM25 * (0.8 + 0.4 * Math.sin(i / 3))))),
      },
    };
  });

  return [...fallbackStations, ...customSensors];
}
