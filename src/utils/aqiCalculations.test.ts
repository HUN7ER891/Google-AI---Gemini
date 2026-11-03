import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBosnianPM25AQI,
  calculateBosnianPM10AQI,
  calculateEpaPM25AQI,
  getOverallAQI,
  evaluateSarajevoCantonEpisode,
  calculateInversionDiagnostic,
} from './aqiCalculations.ts';

test('calculateBosnianPM25AQI calculates accurate breakpoints', () => {
  assert.equal(calculateBosnianPM25AQI(0), 0);
  assert.equal(calculateBosnianPM25AQI(25), 50); // upper limit of good
  assert.equal(calculateBosnianPM25AQI(50), 100); // upper limit of moderate
  assert.equal(calculateBosnianPM25AQI(90), 150); // unhealthy for sensitive
  assert.equal(calculateBosnianPM25AQI(180), 200); // unhealthy
  assert.equal(calculateBosnianPM25AQI(300), 300); // very unhealthy
  assert.ok(calculateBosnianPM25AQI(350) > 300); // hazardous
});

test('calculateBosnianPM10AQI scales appropriately', () => {
  assert.equal(calculateBosnianPM10AQI(25), 25);
  assert.equal(calculateBosnianPM10AQI(50), 50);
  assert.equal(calculateBosnianPM10AQI(100), 100);
});

test('calculateEpaPM25AQI handles US EPA standard', () => {
  assert.equal(calculateEpaPM25AQI(12.0), 50);
  assert.equal(calculateEpaPM25AQI(35.4), 100);
  assert.equal(calculateEpaPM25AQI(55.4), 150);
  assert.equal(calculateEpaPM25AQI(150.4), 200);
});

test('getOverallAQI assigns proper category and dominant pollutant', () => {
  const result = getOverallAQI({ pm25: 120, pm10: 60 }, 'bosnian');
  assert.equal(result.dominantPollutant, 'PM2.5');
  assert.equal(result.category, 'unhealthy');
  assert.equal(result.labelBs, 'Nezdrav');
  assert.equal(result.labelEn, 'Unhealthy');

  const cleanResult = getOverallAQI({ pm25: 8, pm10: 15 }, 'bosnian');
  assert.equal(cleanResult.category, 'good');
  assert.equal(cleanResult.labelBs, 'Dobar');
});

test('evaluateSarajevoCantonEpisode handles emergency alert triggers', () => {
  // Normal conditions
  const normal = evaluateSarajevoCantonEpisode(20, 15, false);
  assert.equal(normal.episode, 'none');

  // Pripravnost trigger
  const pripravnost = evaluateSarajevoCantonEpisode(65, 30, false);
  assert.equal(pripravnost.episode, 'pripravnost');

  // Upozorenje trigger
  const upozorenje = evaluateSarajevoCantonEpisode(170, 95, true);
  assert.equal(upozorenje.episode, 'upozorenje');

  // Uzbuna trigger (Extreme smog episode)
  const uzbuna = evaluateSarajevoCantonEpisode(320, 260, true);
  assert.equal(uzbuna.episode, 'uzbuna');
  assert.equal(uzbuna.severity, 'red');
});

test('calculateInversionDiagnostic detects thermal inversion in Sarajevo basin', () => {
  // Normal lapse rate: mountain is colder than valley
  const normal = calculateInversionDiagnostic(5.0, 1.0, 8.0);
  assert.equal(normal.isInverted, false);
  assert.equal(normal.inversionSeverity, 'none');

  // Inversion: mountain (Trebević) is warmer than valley floor (Otoka)
  const inverted = calculateInversionDiagnostic(1.0, 6.0, 2.0);
  assert.equal(inverted.isInverted, true);
  assert.equal(inverted.tempDelta, 5.0);
  assert.equal(inverted.inversionSeverity, 'severe');
  assert.ok(inverted.estimatedSmogCapAltitudeM > 700);
});
