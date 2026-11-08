import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { StationData } from '../types/airQuality.ts';
import { getOverallAQI } from './aqiCalculations.ts';
import { buildStationTooltip } from './mapTooltip.ts';

const station: StationData = {
  id: 'custom-test',
  name: 'A & B "Station" <West> \'Side\'',
  nameBs: 'Čengić Vila & "Stanica" <Zapad> \'Ulaz\'',
  municipality: 'Novo Sarajevo',
  latitude: 43.85,
  longitude: 18.38,
  elevationM: 530,
  source: 'custom_iot',
  sourceName: 'Test fixture',
  lastUpdated: '2026-11-08T12:00:00Z',
  pollutants: { pm25: 25, pm10: 30 },
  weather: { temperatureC: 10, humidityPct: 50, windSpeedKmH: 5, windDirectionDeg: 0, surfacePressureHPa: 950 },
};
const aqi = getOverallAQI(station.pollutants, 'bosnian');

test('station tooltip preserves both languages and encodes HTML characters', () => {
  const english = buildStationTooltip(station, aqi, false);
  const bosnian = buildStationTooltip(station, aqi, true);

  assert.ok(english.includes('A &amp; B &quot;Station&quot; &lt;West&gt; &#39;Side&#39;'));
  assert.ok(bosnian.includes('Čengić Vila &amp; &quot;Stanica&quot; &lt;Zapad&gt; &#39;Ulaz&#39;'));
  assert.ok(english.includes(aqi.labelEn));
  assert.ok(bosnian.includes(aqi.labelBs));
  assert.ok(english.includes('PM2.5: 25 μg/m³ • 530m n/v'));
  assert.ok(english.includes(`background-color: ${aqi.color}`));
});

test('a custom station name cannot add image, script or event-handler markup', () => {
  const payload = '</span><img src=x onerror="alert(1)"><script>alert(2)</script><span>';
  for (const isBs of [false, true]) {
    const html = buildStationTooltip({ ...station, name: payload, nameBs: payload }, aqi, isBs);
    assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;'));
    assert.doesNotMatch(html, /<\/?(?:img|script)\b/i);
    assert.equal((html.match(/<span\b/g) ?? []).length, 2, 'input must not introduce another element');
  }
});

test('tooltip describes actual provenance instead of claiming an official sensor feed', () => {
  const syntheticStation = { ...station, sourceName: 'Official live sensor', provenance: 'synthetic' as const };
  const english = buildStationTooltip(syntheticStation, aqi, false);
  const bosnian = buildStationTooltip(syntheticStation, aqi, true);
  assert.ok(english.includes('Synthetic example — not a measurement'));
  assert.ok(bosnian.includes('Sintetički primjer — nije mjerenje'));
  assert.ok(!english.includes(syntheticStation.sourceName));
  assert.ok(buildStationTooltip({ ...station, provenance: 'modelled' }, aqi, false).includes('Open-Meteo / CAMS model'));
  assert.ok(buildStationTooltip({ ...station, isCustom: true }, aqi, false).includes('Manual entry + sample supporting values'));
});

test('tooltip encodes all dynamic text and quoted attribute values', () => {
  const hostileAqi = {
    ...aqi,
    aqi: '<b>999</b>' as unknown as number,
    color: '#fff" onmouseover="alert(1)',
    labelEn: '<svg onload=alert(1)> & category',
    dominantPollutant: '<img src=x>',
  };
  const hostileStation = {
    ...station,
    pollutants: { ...station.pollutants, pm25: '<img src=x>' as unknown as number },
    elevationM: '<svg onload=alert(2)>' as unknown as number,
  };
  const html = buildStationTooltip(hostileStation, hostileAqi, false);
  assert.ok(html.includes('style="background-color: #fff&quot; onmouseover=&quot;alert(1)"'));
  assert.ok(html.includes('&lt;svg onload=alert(1)&gt; &amp; category'));
  assert.ok(html.includes('(&lt;img src=x&gt;)'));
  assert.ok(html.includes('AQI &lt;b&gt;999&lt;/b&gt;'));
  assert.ok(html.includes('PM2.5: &lt;img src=x&gt; μg/m³ • &lt;svg onload=alert(2)&gt;m n/v'));
  assert.doesNotMatch(html, /<svg\b|<img\b|<b\b|" onmouseover="/i);
});

test('the map renderer binds the tested tooltip builder and keeps tile attribution visible', () => {
  const renderer = readFileSync(new URL('../components/SarajevoMap.tsx', import.meta.url), 'utf8');
  assert.match(renderer, /import\s*\{\s*buildStationTooltip\s*\}\s*from\s*['"]\.\.\/utils\/mapTooltip\.ts['"]/);
  assert.match(renderer, /marker\.bindTooltip\(\s*buildStationTooltip\(station,\s*aqiRes,\s*isBs\)/);
  assert.doesNotMatch(renderer, /attributionControl:\s*false/);
  assert.match(renderer, /attributionControl:\s*true/);
  assert.match(renderer, /https:\/\/www\.openstreetmap\.org\/copyright/);
  assert.match(renderer, /Powered by <a href="https:\/\/www\.esri\.com\//);
  assert.equal((renderer.match(/attribution:\s*tileAttribution/g) ?? []).length, 2);
});
