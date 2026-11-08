import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { validateManualInput, readManualSensor } from './sensorInput.ts';
import { provenanceLabel, forecastLabel } from './dataProvenance.ts';
import { BASELINE_STATIONS, INITIAL_SERVICES, fetchLiveSarajevoTelemetry, getFallbackSarajevoTelemetry, getCustomSensors, saveCustomSensor } from '../services/airQualityService.ts';

let stored: string | null = null;
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: () => stored,
  setItem: (_key: string, value: string) => { stored = value; },
} });
beforeEach(() => { stored = null; });

const input = { name: 'Manual example', latitude: '0', longitude: '0', elevationM: '0', pm25: '0', pm10: '0', temperatureC: '0' };
function manualSensor() {
  return { ...getFallbackSarajevoTelemetry()[0], id: 'custom_test', isCustom: true, source: 'custom_iot' as const,
    lastUpdated: '2026-01-01T12:00:00Z', provenance: 'manual' as const };
}
function modelResponses() {
  const air = BASELINE_STATIONS.map(() => ({ current: { time: '2026-01-01T12:00', pm2_5: 20, pm10: 30,
    nitrogen_dioxide: 10, sulphur_dioxide: 5, carbon_monoxide: 100, ozone: 15 },
    hourly: { time: ['2026-01-01T12:00'], pm2_5: [20], pm10: [30] } }));
  const weather = BASELINE_STATIONS.map(() => ({ current: { temperature_2m: 0, relative_humidity_2m: 50,
    wind_speed_10m: 0, wind_direction_10m: 0, surface_pressure: 950 } }));
  return { air, weather };
}

test('manual validation preserves zero and decimal values', () => {
  const values = validateManualInput(input);
  assert.equal(values.pm25, 0);
  assert.equal(values.latitude, 0);
  assert.equal(values.temperatureC, 0);
  assert.equal(validateManualInput({ ...input, pm25: '12.5', temperatureC: '-4.5' }).pm25, 12.5);
});

test('manual validation rejects empty, malformed, non-finite and out-of-range inputs', () => {
  for (const patch of [{ name: ' ' }, { latitude: '91' }, { longitude: '-181' }, { elevationM: '9001' },
    { pm25: '' }, { pm25: '-1' }, { pm25: '42abc' }, { pm10: 'Infinity' }, { pm25: '1e308' }, { temperatureC: 'NaN' }]) {
    assert.throws(() => validateManualInput({ ...input, ...patch }));
  }
});

test('untrusted local storage is filtered and legacy manual data gets honest provenance', () => {
  stored = '{}';
  assert.deepEqual(getCustomSensors(), []);
  const sensor = manualSensor();
  stored = JSON.stringify([null, {}, { ...sensor, latitude: 200 }, sensor]);
  const saved = getCustomSensors();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].provenance, 'manual');
  assert.equal(saved[0].forecastProvenance, 'synthetic');
  assert.equal(saved[0].lastUpdated, sensor.lastUpdated);
  assert.equal(readManualSensor({ ...sensor, weather: null }), null);
});

test('invalid custom sensor writes fail before changing storage', () => {
  assert.throws(() => saveCustomSensor({ ...manualSensor(), latitude: 200 }));
  assert.equal(stored, null);
});

test('all 12 fallback locations and their hourly series are explicitly synthetic', () => {
  const stations = getFallbackSarajevoTelemetry();
  assert.equal(stations.length, 12);
  assert.ok(stations.every(s => s.provenance === 'synthetic' && s.forecastProvenance === 'synthetic' && s.lastUpdated === '—'));
  assert.match(provenanceLabel(stations[0], 'en'), /not a measurement/);
  assert.match(forecastLabel(stations[0], 'en'), /not a forecast/);
});

test('service directory reports configuration only, not fabricated health or latency', () => {
  assert.equal(INITIAL_SERVICES.filter(s => s.status === 'configured').length, 1);
  assert.equal(INITIAL_SERVICES.filter(s => s.status === 'reference').length, 5);
  assert.ok(INITIAL_SERVICES.every(s => !('lastPingMs' in s) && !('sensorCount' in s)));
});

test('successful model batch preserves heuristics and does not refresh or fetch manual endpoints', async t => {
  const { air, weather } = modelResponses();
  const sensor = manualSensor();
  sensor.customEndpoint = 'https://sensor.example/data';
  saveCustomSensor(sensor);
  const calls: string[] = [];
  t.mock.method(globalThis, 'fetch', async (url: string) => {
    calls.push(url);
    return { ok: true, json: async () => url.includes('air-quality-api') ? air : weather };
  });
  const stations = await fetchLiveSarajevoTelemetry();
  assert.equal(stations.length, 13);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(url => url.includes('open-meteo.com')));
  assert.equal(stations.find(s => s.id === 'otoka')?.pollutants.pm25, 23);
  assert.equal(stations.filter(s => s.provenance === 'heuristic').length, 4);
  assert.equal(stations.filter(s => s.provenance === 'modelled').length, 8);
  assert.equal(stations.find(s => s.id === 'custom_test')?.lastUpdated, sensor.lastUpdated);
  assert.equal(stations[0].forecastProvenance, 'modelled');
});

test('failed HTTP response is labelled fallback rather than a fresh measurement', async t => {
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
  const stations = await fetchLiveSarajevoTelemetry();
  assert.ok(stations.every(s => s.provenance === 'synthetic'));
});

test('malformed numeric response cannot be passed off as model data', async t => {
  const { air, weather } = modelResponses();
  air[0].current.pm2_5 = null as unknown as number;
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async (url: string) => ({ ok: true, json: async () => url.includes('air-quality-api') ? air : weather }));
  assert.ok((await fetchLiveSarajevoTelemetry()).every(s => s.provenance === 'synthetic'));
});

test('incomplete location batches use labelled fallback', async t => {
  t.mock.method(console, 'warn', () => {});
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => [] }));
  assert.ok((await fetchLiveSarajevoTelemetry()).every(s => s.provenance === 'synthetic'));
});
