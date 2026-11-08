# Data provenance and prototype boundaries

This note describes the public-use revision prepared on 8 November 2026, based on commit `6e65d8e`. It distinguishes implemented behavior from provider references and intended integrations. The revision adds explicit provenance, response/input validation, encoded tooltips, and map attribution. It does not certify the underlying health guidance or environmental calculations.

## Data flow

1. `App.tsx` initializes from generated fallback data.
2. On mount, manual refresh, and every 60 seconds, it calls `fetchLiveSarajevoTelemetry()`.
3. The service sends two parallel browser requests for the 12 predefined coordinates: one Open-Meteo air-quality request and one weather request.
4. It maps responses into typed station objects, applies selected location factors, and appends custom entries from `localStorage`.
5. If either request fails, it returns generated fallback data. The components calculate display categories, summaries, and diagnostics from the resulting objects.

Owning source: [`App.tsx`](../src/App.tsx), [`airQualityService.ts`](../src/services/airQualityService.ts), and [`airQuality.ts`](../src/types/airQuality.ts).

## What is connected

| Displayed source or feature | Actual behavior |
| --- | --- |
| Open-Meteo / CAMS | Requests `air-quality-api.open-meteo.com/v1/air-quality` for current pollutants and hourly arrays. The code also requests AQI fields, but derives its displayed AQI locally. |
| Weather | Requests `api.open-meteo.com/v1/forecast` for current temperature, humidity, wind, and pressure. |
| FHMZ, U.S. Embassy, Eko Akcija | Names, links, and metadata are present. There are no provider-specific data adapters. |
| Sensor.Community / PurpleAir | Predefined location labels and source selections are present. There are no implemented provider requests. |
| Source directory | One configured Open-Meteo source and five external references. It does not claim measured service health, latency, or connected sensor counts. |
| Custom sensor URL | Stored as `customEndpoint`; not fetched. Custom entries retain manually entered or default values. |
| Manual-entry validation | Checks the name, finite numeric values, and coordinate/value ranges, preserving valid zeroes. The UI states that no device or endpoint is contacted. |
| Device API example | The modal contains an illustrative HTTP POST example. The repository has no corresponding `/api/telemetry` handler. |
| Gemini | Dependency and AI Studio template metadata are present; no runtime Gemini request is implemented. |

The relevant implementation is in [`airQualityService.ts`](../src/services/airQualityService.ts) and [`ConnectSensorModal.tsx`](../src/components/ConnectSensorModal.tsx). A source label is not a statement of provider partnership, data access, or station calibration.

## Transformations, timestamps, and generated values

Fetched current concentrations are changed for selected locations:

| Location | Transformation in the code |
| --- | --- |
| Trebević | PM2.5 × 0.28, PM10 × 0.30, NO2 × 0.20, with minimum values and rounding |
| Otoka and U.S. Embassy locations | PM2.5 × 1.15 and PM10 × 1.12, rounded |
| Ilijaš | SO2 × 1.60, rounded |

These are fixed heuristics, not a demonstrated calibration or measured improvement in accuracy. Their locations are labelled `heuristic`; other successful model locations are labelled `modelled`. Incomplete location batches, invalid current numbers, or malformed hourly arrays trigger labelled synthetic fallback data instead of being presented as valid model responses. Provenance is recorded at the location/forecast level, not separately for every pollutant.

Fallback data is generated from fixed mountain, industrial, and valley patterns, including a sinusoidal hourly series. It is explicitly labelled synthetic and does not receive a current observation timestamp. Manual entries retain their saved timestamp when model data refreshes; their hourly PM2.5/PM10 curves are generated using `Math.random()` when added and labelled as synthetic sample series. Supporting pollutant/weather defaults in manual entries are also identified as sample values.

The air-quality request asks for three forecast days; the service keeps the first 48 hourly entries and the chart displays the first 24. It does not filter them from the current time, and hourly AQI uses the local Bosnian PM2.5 function regardless of the selected AQI mode. Current-value location factors are not also applied to the hourly arrays.

Owning source: [`airQualityService.ts`](../src/services/airQualityService.ts), [`ConnectSensorModal.tsx`](../src/components/ConnectSensorModal.tsx), and [`ForecastChart.tsx`](../src/components/ForecastChart.tsx).

## Calculation boundaries

[`aqiCalculations.ts`](../src/utils/aqiCalculations.ts) contains the implemented rules:

- The Bosnian mode interpolates PM2.5/PM10 and uses simplified proportional NO2/SO2 conversions.
- The EPA mode has a separate PM2.5 table but reuses the Bosnian PM10 function.
- The EAQI mode reuses the Bosnian PM2.5 conversion rather than implementing a complete independent European index.
- Canton episode labels are derived from current aggregate pollutant values and inversion state. The code does not establish the duration windows or official decision needed to assert a declared episode.
- The inversion diagnostic compares valley and mountain temperature and valley wind. Its severity and smog-cap altitude are heuristics, not a validated meteorological model.

Six calculation tests verify selected outputs of these functions. The additional data/input/tooltip tests cover implementation behavior. Neither group proves that the functions reproduce current regulatory standards, predict health outcomes, or accurately estimate real-world conditions. Prototype estimates and reference health information still require separate domain validation.

## Storage and external requests

Custom sensor records are stored under `sarajevo_custom_sensors_v1` in browser `localStorage`. They are browser/origin-specific; there is no implemented account, shared database, or cross-device synchronization. The stored endpoint is plain text, so credentials and private access tokens must not be placed in it.

The browser also requests ArcGIS map tiles, Google Fonts, and a Leaflet stylesheet from unpkg. This is not a fully offline application. Leaflet attribution is enabled and both map-tile layers supply attribution text and provider links. Third-party service and media terms still apply independently of the project's MIT license.

Manual inputs and stored records are validated by [`sensorInput.ts`](../src/utils/sensorInput.ts) before use. Dynamic tooltip text and quoted attribute values pass through [`mapTooltip.ts`](../src/utils/mapTooltip.ts), with tests for hostile HTML and attribute-breaking input. This is a bounded hardening measure, not a full security certification; shared or externally ingested sensor records would need their own threat model and validation.

## Next implementation milestones

1. Preserve raw provider values alongside derived values and add more granular freshness/provenance metadata where needed.
2. Implement and test real device/provider adapters before presenting connection or ingestion success.
3. Validate AQI and episode rules against authoritative specifications, with additional boundary tests.
4. Align hourly records to the intended forecast window and selected AQI mode.
5. Extend browser, live API, failure-state, and accessibility verification beyond the automated tests and owner's practical acceptance.

These are future tasks, not completed features or a promise of deployment readiness.
