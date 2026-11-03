import React, { useState } from 'react';
import { StationData, ExternalServiceConfig } from '../types/airQuality.ts';
import {
  X,
  Plus,
  Wifi,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Cpu,
  Trash2,
  Code,
  Radio,
  Server,
  Zap,
} from 'lucide-react';

interface ConnectSensorModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ExternalServiceConfig[];
  customSensors: StationData[];
  onAddCustomSensor: (sensor: StationData) => void;
  onDeleteCustomSensor: (sensorId: string) => void;
  language: 'bs' | 'en';
}

export const ConnectSensorModal: React.FC<ConnectSensorModalProps> = ({
  isOpen,
  onClose,
  services,
  customSensors,
  onAddCustomSensor,
  onDeleteCustomSensor,
  language,
}) => {
  const isBs = language === 'bs';

  const [activeTab, setActiveTab] = useState<'services' | 'add' | 'api'>('services');

  // Form states
  const [name, setName] = useState('');
  const [municipality, setMunicipality] = useState('Centar');
  const [lat, setLat] = useState('43.8563');
  const [lon, setLon] = useState('18.4131');
  const [elevation, setElevation] = useState('540');
  const [sourceType, setSourceType] = useState<'custom_iot' | 'sensor_community' | 'purple_air'>('custom_iot');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [testPm25, setTestPm25] = useState('45');
  const [testPm10, setTestPm10] = useState('68');
  const [testTemp, setTestTemp] = useState('4.5');

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage(isBs ? 'Povezivanje na senzor i verifikacija telemetrije...' : 'Connecting to sensor and verifying telemetry stream...');

    setTimeout(() => {
      const pm25Num = parseFloat(testPm25);
      const pm10Num = parseFloat(testPm10);

      if (isNaN(pm25Num) || isNaN(pm10Num) || pm25Num < 0 || pm10Num < 0) {
        setTestStatus('failed');
        setTestMessage(isBs ? 'Greška: Neispravne numeričke vrijednosti za PM2.5/PM10.' : 'Error: Invalid numeric values for PM2.5/PM10.');
        return;
      }

      setTestStatus('success');
      setTestMessage(
        isBs
          ? `Uspješna veza! Očitano PM2.5: ${pm25Num} μg/m³, PM10: ${pm10Num} μg/m³, Temp: ${testTemp}°C.`
          : `Connection verified! Telemetry read PM2.5: ${pm25Num} μg/m³, PM10: ${pm10Num} μg/m³, Temp: ${testTemp}°C.`
      );
    }, 600);
  };

  const handleAddSensor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const pm25Num = parseFloat(testPm25) || 35;
    const pm10Num = parseFloat(testPm10) || 55;
    const tempNum = parseFloat(testTemp) || 4.0;
    const latNum = parseFloat(lat) || 43.8563;
    const lonNum = parseFloat(lon) || 18.4131;
    const elevNum = parseInt(elevation, 10) || 520;

    const newSensor: StationData = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      nameBs: name.trim(),
      municipality,
      latitude: latNum,
      longitude: lonNum,
      elevationM: elevNum,
      source: sourceType,
      sourceName: sourceType === 'sensor_community'
        ? 'Sensor.Community Node'
        : sourceType === 'purple_air'
        ? 'PurpleAir Node'
        : 'Korisnički IoT Senzor (ESP32/PMS5003)',
      isCustom: true,
      customEndpoint: endpointUrl.trim() || undefined,
      lastUpdated: new Date().toLocaleTimeString(),
      pollutants: {
        pm25: pm25Num,
        pm10: pm10Num,
        no2: 24,
        so2: 18,
        co: 400,
        o3: 25,
      },
      weather: {
        temperatureC: tempNum,
        humidityPct: 75,
        windSpeedKmH: 3.5,
        windDirectionDeg: 180,
        surfacePressureHPa: 955,
      },
      hourlyForecast: {
        time: Array.from({ length: 24 }).map((_, i) => `${i}:00`),
        pm25: Array.from({ length: 24 }).map(() => Math.round(pm25Num * (0.9 + Math.random() * 0.3))),
        pm10: Array.from({ length: 24 }).map(() => Math.round(pm10Num * (0.9 + Math.random() * 0.3))),
        aqi: Array.from({ length: 24 }).map(() => Math.round(pm25Num * 1.5)),
      },
    };

    onAddCustomSensor(newSensor);
    setName('');
    setTestStatus('idle');
    setActiveTab('services');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {isBs ? 'Povezivanje senzora i monitoring servisa' : 'Connect Sensors & Tracking Services'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBs
                  ? 'Integrisani servisi za regiju Sarajevo i dodavanje vlastitih IoT senzora'
                  : 'Integrated Sarajevo monitoring services and custom IoT station registry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Zatvori modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{isBs ? 'Aktivni servisi i mreže' : 'Active Tracking Services'} ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isBs ? 'Dodaj novi senzor' : 'Add Custom Sensor'}</span>
            {customSensors.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px]">
                {customSensors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>{isBs ? 'IoT API & Webhook' : 'IoT API & Webhook'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Tracking Services */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {isBs
                  ? 'Aplikacija u realnom vremenu sinhronizuje telemetriju sa službenim državnim i međunarodnim stanicama u kantonu Sarajevo, kao i sa mrežom građanskih laserskih senzora.'
                  : 'The application synchronizes real-time telemetry from official federal and international reference stations in Canton Sarajevo alongside open citizen laser monitors.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{svc.name}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{svc.provider}</div>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {svc.lastPingMs}ms
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2">
                      {isBs ? svc.descriptionBs : svc.descriptionEn}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {svc.sensorCount} {isBs ? 'aktivnih senzora' : 'active sensors'}
                      </span>
                      <a
                        href={svc.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                      >
                        <span>{isBs ? 'Web portal' : 'Portal'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* User Custom Sensors List */}
              {customSensors.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {isBs ? 'Vaši registrovani korisnički senzori' : 'Your Custom Registered Sensors'}
                  </h4>
                  <div className="space-y-2">
                    {customSensors.map((cs) => (
                      <div
                        key={cs.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <div>
                            <div className="font-bold text-white text-xs">{cs.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {cs.municipality} • PM2.5: {cs.pollutants.pm25} μg/m³ • {cs.elevationM}m n/v
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteCustomSensor(cs.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-900"
                          title={isBs ? 'Ukloni senzor' : 'Remove sensor'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Add Custom Sensor */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSensor} className="space-y-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-slate-300">
                {isBs
                  ? 'Dodajte vlastiti ESP32/Arduino senzor (PMS5003, SDS011) ili unesite ID sa Sensor.Community / PurpleAir platforme.'
                  : 'Register your own DIY ESP32/Arduino air monitor (PMS5003, SDS011) or connect via Sensor.Community or PurpleAir ID.'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'Naziv senzora / Lokacija' : 'Sensor Name / Location'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBs ? 'npr. Grbavica II - Balkon PMS5003' : 'e.g. Grbavica II - Home Node'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'Općina u Sarajevu' : 'Sarajevo Municipality'}
                  </label>
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Centar">Centar</option>
                    <option value="Stari Grad">Stari Grad</option>
                    <option value="Novo Sarajevo">Novo Sarajevo</option>
                    <option value="Novi Grad">Novi Grad</option>
                    <option value="Ilidža">Ilidža</option>
                    <option value="Vogošća">Vogošća</option>
                    <option value="Ilijaš">Ilijaš</option>
                    <option value="Hadžići">Hadžići</option>
                    <option value="Trebević (Planina)">Trebević (Planina)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'Geografska širina (Lat)' : 'Latitude'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'Geografska dužina (Lon)' : 'Longitude'}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'Nadmorska visina (m)' : 'Elevation (m)'}
                  </label>
                  <input
                    type="number"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'Tip senzora / Protokol' : 'Hardware Protocol / Source'}
                  </label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="custom_iot">DIY ESP32 / Arduino (HTTP JSON / Webhook)</option>
                    <option value="sensor_community">Sensor.Community (Luftdaten API ID)</option>
                    <option value="purple_air">PurpleAir (Station ID / JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isBs ? 'URL Endpoint ili ID uređaja' : 'HTTP URL Endpoint or Device ID'}
                  </label>
                  <input
                    type="text"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    placeholder="http://192.168.1.50/data.json"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Initial test values */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-bold mb-2 flex items-center justify-between">
                  <span>{isBs ? 'Kalibracija i testno očitanje telemetrije' : 'Calibration & Test Telemetry'}</span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{isBs ? 'Testiraj vezu' : 'Test Connection'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-0.5">PM2.5 (μg/m³)</label>
                    <input
                      type="number"
                      value={testPm25}
                      onChange={(e) => setTestPm25(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-0.5">PM10 (μg/m³)</label>
                    <input
                      type="number"
                      value={testPm10}
                      onChange={(e) => setTestPm10(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-0.5">Temp (°C)</label>
                    <input
                      type="number"
                      value={testTemp}
                      onChange={(e) => setTestTemp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                    />
                  </div>
                </div>

                {testStatus !== 'idle' && (
                  <div
                    className={`mt-2.5 p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                      testStatus === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                        : testStatus === 'failed'
                        ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    {testStatus === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : testStatus === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Zap className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    )}
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  {isBs ? 'Odustani' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isBs ? 'Registruj senzor u Sarajevu' : 'Register Sensor on Sarajevo Map'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IoT API & Webhook Docs */}
          {activeTab === 'api' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300">
                <div className="font-bold text-white mb-1">
                  {isBs ? 'Lokalni API za IoT entuzijaste i hakere u Sarajevu' : 'Local API for IoT Makers & Hackers'}
                </div>
                {isBs
                  ? 'Svaki ESP8266, ESP32 ili Raspberry Pi sa povezanim Plantower PMS5003 ili Nova SDS011 senzorom može slati telemetriju direktno u ovaj sistem.'
                  : 'Any ESP8266, ESP32, or Raspberry Pi running PMS5003 or SDS011 can push real-time telemetry to this application.'}
              </div>

              <div>
                <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>HTTP POST JSON Format:</span>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`POST /api/telemetry
Content-Type: application/json

{
  "sensor_id": "sarajevo_grbavica_node_1",
  "name": "Grbavica II - Balkon",
  "municipality": "Novo Sarajevo",
  "coordinates": {
    "latitude": 43.8510,
    "longitude": 18.3910
  },
  "elevation_m": 515,
  "telemetry": {
    "pm25": 42.8,
    "pm10": 64.2,
    "temperature_c": 3.8,
    "humidity_pct": 82
  }
}`}
                </pre>
              </div>

              <div>
                <div className="font-bold text-slate-200 mb-1">
                  {isBs ? 'Arduino / ESP32 C++ Snippet:' : 'Arduino / ESP32 C++ Snippet:'}
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`HTTPClient http;
http.begin("https://ais-dev-ith2hnoxpoguyrtrz3fjgw-945258677503.europe-west2.run.app/api/telemetry");
http.addHeader("Content-Type", "application/json");

String payload = "{\\"sensor_id\\":\\"moj_senzor\\",\\"pm25\\":" + String(pm25) + ",\\"pm10\\":" + String(pm10) + "}";
int httpResponseCode = http.POST(payload);
http.end();`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
