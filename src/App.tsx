import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StationData, ExternalServiceConfig } from './types/airQuality.ts';
import {
  fetchLiveSarajevoTelemetry,
  getFallbackSarajevoTelemetry,
  getCustomSensors,
  saveCustomSensor,
  removeCustomSensor,
  INITIAL_SERVICES,
} from './services/airQualityService.ts';
import {
  getOverallAQI,
  evaluateSarajevoCantonEpisode,
  calculateInversionDiagnostic,
  AQIStandard,
} from './utils/aqiCalculations.ts';

import { Header } from './components/Header.tsx';
import { CantonEpisodeBanner } from './components/CantonEpisodeBanner.tsx';
import { SarajevoMap } from './components/SarajevoMap.tsx';
import { StationDetail } from './components/StationDetail.tsx';
import { InversionAnalyzer } from './components/InversionAnalyzer.tsx';
import { StationGrid } from './components/StationGrid.tsx';
import { ForecastChart } from './components/ForecastChart.tsx';
import { ConnectSensorModal } from './components/ConnectSensorModal.tsx';
import { HealthAdvisoryModal } from './components/HealthAdvisoryModal.tsx';

import {
  MapPin,
  Mountain,
  Activity,
  Layers,
  CloudFog,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Radio,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'bs' | 'en'>('bs');
  const [aqiStandard, setAqiStandard] = useState<AQIStandard>('bosnian');
  const [stations, setStations] = useState<StationData[]>(() => getFallbackSarajevoTelemetry());
  const [selectedStationId, setSelectedStationId] = useState<string | null>('otoka');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [services, setServices] = useState<ExternalServiceConfig[]>(INITIAL_SERVICES);
  const [customSensors, setCustomSensors] = useState<StationData[]>(() => getCustomSensors());

  // Modals & Navigation
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [mainView, setMainView] = useState<'map_and_detail' | 'inversion' | 'forecast' | 'all_stations'>('map_and_detail');

  const isBs = language === 'bs';

  // Load telemetry
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchLiveSarajevoTelemetry();
      setStations(data);
      setCustomSensors(getCustomSensors());
      setLastRefreshTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load Sarajevo air quality data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Selected station object
  const selectedStation = useMemo(() => {
    if (!stations.length) return null;
    return stations.find((s) => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Valley station (Otoka or Centar) and mountain station (Trebević)
  const valleyStation = useMemo(() => {
    return stations.find((s) => s.id === 'otoka') || stations.find((s) => s.id === 'us_embassy') || stations[0] || null;
  }, [stations]);

  const mountainStation = useMemo(() => {
    return stations.find((s) => s.id === 'trebevic') || stations.find((s) => s.elevationM >= 1000) || null;
  }, [stations]);

  // Inversion detection
  const inversion = useMemo(() => {
    const vTemp = valleyStation?.weather?.temperatureC ?? 2.0;
    const mTemp = mountainStation?.weather?.temperatureC ?? 5.0;
    const vWind = valleyStation?.weather?.windSpeedKmH ?? 3.0;
    return calculateInversionDiagnostic(vTemp, mTemp, vWind);
  }, [valleyStation, mountainStation]);

  // Canton metrics & Episode evaluation
  const cantonMetrics = useMemo(() => {
    if (!stations.length) {
      return {
        avgPM10: 45,
        avgPM25: 35,
        avgAQI: 50,
        maxAQI: 50,
        worstStation: null,
        cleanestStation: null,
      };
    }

    let sumPM10 = 0;
    let sumPM25 = 0;
    let sumAQI = 0;
    let maxAQI = -1;
    let minAQI = 9999;
    let worst: StationData | null = null;
    let cleanest: StationData | null = null;

    stations.forEach((s) => {
      sumPM10 += s.pollutants.pm10;
      sumPM25 += s.pollutants.pm25;
      const aqi = getOverallAQI(s.pollutants, aqiStandard).aqi;
      sumAQI += aqi;

      if (aqi > maxAQI) {
        maxAQI = aqi;
        worst = s;
      }
      if (aqi < minAQI) {
        minAQI = aqi;
        cleanest = s;
      }
    });

    const count = stations.length;
    return {
      avgPM10: Math.round(sumPM10 / count),
      avgPM25: Math.round(sumPM25 / count),
      avgAQI: Math.round(sumAQI / count),
      maxAQI,
      worstStation: worst,
      cleanestStation: cleanest,
    };
  }, [stations, aqiStandard]);

  // Official Canton Episode
  const episodeStatus = useMemo(() => {
    return evaluateSarajevoCantonEpisode(
      cantonMetrics.avgPM10,
      cantonMetrics.avgPM25,
      inversion.isInverted
    );
  }, [cantonMetrics, inversion.isInverted]);

  const currentOverallAQI = useMemo(() => {
    if (selectedStation) {
      return getOverallAQI(selectedStation.pollutants, aqiStandard);
    }
    return getOverallAQI({ pm25: cantonMetrics.avgPM25, pm10: cantonMetrics.avgPM10 }, aqiStandard);
  }, [selectedStation, cantonMetrics, aqiStandard]);

  // Custom sensor handlers
  const handleAddCustomSensor = (sensor: StationData) => {
    saveCustomSensor(sensor);
    setCustomSensors(getCustomSensors());
    setStations((prev) => [sensor, ...prev]);
    setSelectedStationId(sensor.id);
  };

  const handleDeleteCustomSensor = (sensorId: string) => {
    removeCustomSensor(sensorId);
    setCustomSensors(getCustomSensors());
    setStations((prev) => prev.filter((s) => s.id !== sensorId));
    if (selectedStationId === sensorId) {
      setSelectedStationId('otoka');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        aqiStandard={aqiStandard}
        setAqiStandard={setAqiStandard}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        lastRefreshTime={lastRefreshTime}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onOpenHealthModal={() => setIsHealthModalOpen(true)}
        activeEpisodeSeverity={episodeStatus.severity}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Canton Episode Alert Banner */}
        <CantonEpisodeBanner
          episodeStatus={episodeStatus}
          language={language}
          worstStationName={cantonMetrics.worstStation ? (isBs ? cantonMetrics.worstStation.nameBs : cantonMetrics.worstStation.name) : undefined}
          maxAQI={cantonMetrics.maxAQI}
          inversionActive={inversion.isInverted}
        />

        {/* Quick Canton Status Cards Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Canton Average AQI */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isBs ? 'Prosjek Kantona Sarajevo' : 'Sarajevo Canton Average'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {cantonMetrics.avgAQI}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded text-white" style={{ backgroundColor: currentOverallAQI.color }}>
                {isBs ? currentOverallAQI.labelBs : currentOverallAQI.labelEn}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              PM2.5: {cantonMetrics.avgPM25} μg/m³ • PM10: {cantonMetrics.avgPM10} μg/m³
            </div>
          </div>

          {/* Worst Station */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              {isBs ? 'Najviša zagađenost' : 'Highest Pollution Node'}
            </span>
            <div className="mt-1">
              <div className="text-sm font-bold text-white line-clamp-1">
                {cantonMetrics.worstStation ? (isBs ? cantonMetrics.worstStation.nameBs : cantonMetrics.worstStation.name) : '--'}
              </div>
              <div className="text-xl font-black text-rose-400">
                AQI {cantonMetrics.maxAQI}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {cantonMetrics.worstStation?.municipality || 'Sarajevo'}
            </div>
          </div>

          {/* Cleanest Mountain Reference */}
          <div className="bg-slate-900/80 border border-purple-900/40 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5" />
              <span>{isBs ? 'Planinsko utočište' : 'Mountain Refuge'}</span>
            </span>
            <div className="mt-1">
              <div className="text-sm font-bold text-white line-clamp-1">
                {mountainStation ? (isBs ? mountainStation.nameBs : mountainStation.name) : '--'}
              </div>
              <div className="text-xl font-black text-emerald-400">
                AQI {mountainStation ? getOverallAQI(mountainStation.pollutants, aqiStandard).aqi : '--'}
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
              {isBs ? '1.160m n/v • Čist zrak' : '1,160m • Clean Air'}
            </div>
          </div>

          {/* Connected Tracking Services */}
          <div
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                {isBs ? 'Povezani servisi' : 'Tracking Services'}
              </span>
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-white">
                {services.length}
              </span>
              <span className="text-xs text-slate-400">
                {isBs ? 'servisa' : 'services'} ({stations.length} {isBs ? 'senzora' : 'sensors'})
              </span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold group-hover:underline flex items-center gap-1 mt-1">
              <span>{isBs ? '+ Poveži novi senzor' : '+ Connect new sensor'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setMainView('map_and_detail')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              mainView === 'map_and_detail'
                ? 'bg-emerald-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isBs ? 'Interaktivna mapa i detalji stanice' : 'Interactive Map & Station View'}</span>
          </button>

          <button
            onClick={() => setMainView('inversion')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              mainView === 'inversion'
                ? 'bg-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CloudFog className="w-3.5 h-3.5" />
            <span>{isBs ? 'Temperaturna inverzija i kotlina' : 'Valley Inversion & Smog Trap'}</span>
            {inversion.isInverted && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setMainView('forecast')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              mainView === 'forecast'
                ? 'bg-cyan-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isBs ? '24h Prognoza zagađenja' : '24h Pollution Forecast'}</span>
          </button>

          <button
            onClick={() => setMainView('all_stations')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              mainView === 'all_stations'
                ? 'bg-slate-700 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isBs ? 'Sve stanice i općine' : 'All Stations & Municipalities'} ({stations.length})</span>
          </button>
        </div>

        {/* View Content */}
        {mainView === 'map_and_detail' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column */}
              <div className="lg:col-span-7">
                <SarajevoMap
                  stations={stations}
                  selectedStationId={selectedStationId}
                  onSelectStation={(st) => setSelectedStationId(st.id)}
                  aqiStandard={aqiStandard}
                  language={language}
                />
              </div>

              {/* Station Deep-Dive Column */}
              <div className="lg:col-span-5">
                <StationDetail
                  station={selectedStation}
                  aqiStandard={aqiStandard}
                  language={language}
                  onOpenConnectModal={() => setIsConnectModalOpen(true)}
                />
              </div>
            </div>

            {/* Quick Inversion Summary Teaser */}
            <InversionAnalyzer
              valleyStation={valleyStation}
              mountainStation={mountainStation}
              language={language}
            />

            {/* Forecast Chart */}
            <ForecastChart
              station={selectedStation}
              language={language}
            />

            {/* Station Matrix Table */}
            <StationGrid
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(st) => setSelectedStationId(st.id)}
              aqiStandard={aqiStandard}
              language={language}
            />
          </div>
        )}

        {mainView === 'inversion' && (
          <div className="space-y-6">
            <InversionAnalyzer
              valleyStation={valleyStation}
              mountainStation={mountainStation}
              language={language}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StationDetail
                station={valleyStation}
                aqiStandard={aqiStandard}
                language={language}
              />
              <StationDetail
                station={mountainStation}
                aqiStandard={aqiStandard}
                language={language}
              />
            </div>
          </div>
        )}

        {mainView === 'forecast' && (
          <div className="space-y-6">
            <ForecastChart
              station={selectedStation}
              language={language}
            />

            <StationGrid
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(st) => setSelectedStationId(st.id)}
              aqiStandard={aqiStandard}
              language={language}
            />
          </div>
        )}

        {mainView === 'all_stations' && (
          <div className="space-y-6">
            <StationGrid
              stations={stations}
              selectedStationId={selectedStationId}
              onSelectStation={(st) => {
                setSelectedStationId(st.id);
                setMainView('map_and_detail');
              }}
              aqiStandard={aqiStandard}
              language={language}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-400">EkoZrak Sarajevo</span> •{' '}
            {isBs
              ? 'Monitoring kvaliteta zraka u regiji Sarajevo (Kanton Sarajevo, BiH)'
              : 'Sarajevo Region Air Quality & Pollution Monitor (Canton Sarajevo, BiH)'}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Izvori: FHMZ BiH, Ambasada SAD, Eko Akcija, Copernicus CAMS</span>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              {isBs ? 'Poveži senzor' : 'Connect sensor'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConnectSensorModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        services={services}
        customSensors={customSensors}
        onAddCustomSensor={handleAddCustomSensor}
        onDeleteCustomSensor={handleDeleteCustomSensor}
        language={language}
      />

      <HealthAdvisoryModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        currentAQIResult={currentOverallAQI}
        language={language}
      />
    </div>
  );
}
