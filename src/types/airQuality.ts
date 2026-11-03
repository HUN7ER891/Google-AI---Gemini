export type StationSource = 'fhmz' | 'us_embassy' | 'eko_akcija' | 'open_meteo' | 'sensor_community' | 'purple_air' | 'custom_iot';

export interface StationData {
  id: string;
  name: string;
  nameBs: string;
  municipality: string; // Centar, Stari Grad, Novo Sarajevo, Novi Grad, Ilidža, Vogošća, Ilijaš, Hadžići, Mountain
  latitude: number;
  longitude: number;
  elevationM: number;
  source: StationSource;
  sourceName: string;
  isCustom?: boolean;
  customEndpoint?: string;
  lastUpdated: string;
  pollutants: {
    pm25: number;      // μg/m³
    pm10: number;      // μg/m³
    no2?: number;      // μg/m³
    so2?: number;      // μg/m³
    co?: number;       // μg/m³
    o3?: number;       // μg/m³
  };
  weather: {
    temperatureC: number;
    humidityPct: number;
    windSpeedKmH: number;
    windDirectionDeg: number;
    surfacePressureHPa: number;
  };
  hourlyForecast?: {
    time: string[];
    pm25: number[];
    pm10: number[];
    aqi: number[];
  };
}

export interface CantonSummary {
  averageAQI: number;
  maxAQI: number;
  worstStation: StationData | null;
  cleanestStation: StationData | null;
  dominantPollutant: string;
  activeEpisode: 'none' | 'pripravnost' | 'upozorenje' | 'uzbuna';
  totalStations: number;
  inversionActive: boolean;
  inversionDeltaC: number;
}

export interface ExternalServiceConfig {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'degraded' | 'custom' | 'ready';
  lastPingMs: number;
  descriptionBs: string;
  descriptionEn: string;
  websiteUrl: string;
  sensorCount: number;
}
