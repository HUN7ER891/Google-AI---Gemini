# Sarajevo Air Watch

**A bilingual air-quality dashboard prototype for Sarajevo and its surrounding basin.**

Sarajevo Air Watch brings location-based pollution data, weather, and a valley-versus-mountain comparison into one interface. It explores a practical local question: how can residents understand air-quality conditions across their city without switching between disconnected charts and maps?

The application combines a React/TypeScript interface, a Leaflet map, browser-side Open-Meteo requests, and locally stored custom sensor entries. It was developed through an AI-assisted workflow in Google AI Studio and exported from the Google Gemini AI Studio repository template.

**Project owner:** Emir Džumhur / Operator × EmmA. The portfolio contribution covers product direction, a Sarajevo-specific user experience, and AI-assisted implementation. This repository contains the interface and data-processing implementation; it does not establish public adoption, commercial results, or certified environmental monitoring.

[Original AI Studio project link]([https://ai.studio/apps/5b23abff-3b53-497c-8808-83e9a01ce6c7](https://aistudio.google.com/apps/5b23abff-3b53-497c-8808-83e9a01ce6c7?fullscreenApplet=true&showAssistant=true&showPreview=true)) · [Data sources and limitations](docs/DATA_AND_LIMITATIONS.md) · [Verification record](docs/VERIFICATION.md)

The repository is the primary review artifact. The AI Studio link may require a Google account and onboarding; the hosted application was not verified in this review.

The project owner reports using the original hosted application personally every day and accepting it after practical comparisons with news and provider websites. That acceptance applies to the original hosted version; the public-use revision's automated checks are recorded separately below.

> **Status: prototype, personally used by its owner.** Open-Meteo is the implemented network data source. The public-use revision labels model data, local heuristics, synthetic fallback data, and manual entries separately. Provider reference links are distinct from implemented integrations. See the data notes before interpreting the display as a measurement or official alert.

## What the project demonstrates

| Capability | Implementation |
| --- | --- |
| Local context | 12 predefined Sarajevo-area locations, including valley, hillside, and Trebević reference points |
| Bilingual interface | Bosnian and English interface states, with Bosnian selected initially |
| Four main views | Map and station details, inversion analysis, forecast chart, and all-station overview |
| Data integration | Parallel requests for air quality and weather across the predefined coordinates |
| Refresh flow | Initial load, manual refresh, and a 60-second polling interval |
| Visual interpretation | AQI-colored map markers, pollutant details, summary cards, and hourly PM2.5/PM10 charts |
| Local customization | Validated manual sensor entries persisted in browser `localStorage`, preserving valid zero values |
| Data provenance | Explicit labels for modelled, heuristic, synthetic, and manual values; invalid or incomplete API responses use labelled fallback data |
| Safer mapping | Encoded tooltip content and visible attribution for both map-tile layers |
| Automated checks | 21 tests covering calculations, provenance, response failures, manual input, and tooltip rendering |

These are implementation counts, not usage or impact metrics. The project shows how an AI-assisted product workflow can turn a specific local problem into a multi-view application with typed data, reusable components, API integration, and independently runnable calculation tests.

## Stack and structure

- **UI:** React 19, TypeScript, Tailwind CSS 4, Lucide icons.
- **Mapping:** Leaflet 1.9 with ArcGIS dark-gray map tiles.
- **Tooling:** Vite 8, npm, and a checked-in `package-lock.json`.
- **Persistence:** Browser `localStorage`; no application database.
- **Tests:** Node's built-in test runner and strict assertions.

```text
src/
  App.tsx                         State, polling, navigation, and summaries
  components/                     Map, details, charts, modals, and bilingual views
  services/airQualityService.ts    Open-Meteo requests, fallback data, local storage
  types/airQuality.ts              Station, weather, pollutant, and service types
  utils/aqiCalculations.ts         AQI and diagnostic calculations
  utils/dataProvenance.ts          Model, heuristic, synthetic, and manual labels
  utils/sensorInput.ts             Manual-entry and stored-record validation
  utils/mapTooltip.ts              Encoded map tooltip rendering
  utils/*.test.ts                  Calculation, data-flow, input, and tooltip tests
docs/
  DATA_AND_LIMITATIONS.md          Provenance and production gaps
  VERIFICATION.md                  Checks actually performed
```

The application is a browser-side single-page app. Although `express`, `dotenv`, and `@google/genai` are listed as dependencies, the current source does not implement an Express server or call Gemini. AI-assisted development is distinct from a runtime AI feature.

## Local setup

Use **Node.js 24** with npm. The checked-in `package-lock.json` is the canonical dependency lockfile. Installation with lifecycle scripts disabled was verified using Node **24.12.0** and npm **11.6.2**.

```sh
git clone https://github.com/HUN7ER891/Google-AI---Gemini.git
cd Google-AI---Gemini
npm ci --ignore-scripts
npm run dev
```

The development script selects port **3000**, restricts the server to `127.0.0.1`, and fails on a port conflict. Check availability first; select a different available port with `npm run dev -- --port PORT_NUMBER` when needed. Both development and preview scripts bind only to loopback and use `--strictPort`.

Open `http://127.0.0.1:3000` when using the default port. Network access is needed for Open-Meteo, map tiles, fonts, and the external Leaflet stylesheet. Failure of either telemetry request triggers synthetic fallback data; it does not make the application a fully offline monitoring tool.

### Configuration

No API key is referenced by the current telemetry code.

| Variable | Current use |
| --- | --- |
| `DISABLE_HMR` | Optional process environment setting. `true` disables HMR and file watching in `vite.config.ts`. |
| `GEMINI_API_KEY` | AI Studio template placeholder; not read by the current application source. |
| `APP_URL` | AI Studio template placeholder; not read by the current application source. |

The `.env.example` file documents these names with empty values. Copying it is not required to run the implemented Open-Meteo flow. Do not put credentials into browser code or custom sensor URLs. If a future feature uses a secret, it needs an appropriate server-side integration.

### Checks and build commands

```sh
# The tests use Node 24's built-in runner:
npm test

# Require installed project dependencies:
npm run lint
npm run build
npm run preview -- --port 4173
```

`lint` runs `tsc --noEmit`; it is a TypeScript check, not an ESLint task. `build` invokes Vite and writes `dist/`. `npm test` runs the TypeScript test files through Node's built-in test runner. The existing `clean` script uses POSIX `rm` and is not a portable Windows command.

Port **4173** in the preview command is an example: check that it is available, or replace it with another explicitly chosen free port. These instructions do not start a hosted deployment.

## Reading the data honestly

- **Open-Meteo is queried for all predefined coordinates.** A location named after an official station is not proof of a direct connection to that station.
- **Several current readings are modified by fixed location factors.** They are not raw, calibrated station measurements.
- **Fallback readings and custom-sensor forecasts are generated and labelled.** They do not represent new observations; manual entries retain their saved timestamp when model data refreshes.
- **Custom sensors are local entries.** The form validates the entered values and explicitly states that it does not contact a device. There is no implemented telemetry ingestion API.
- **AQI modes and inversion/episode labels are prototype calculations.** Some modes reuse approximate conversions, and episode labels do not represent an official declaration. Health and regulatory copy has not been independently validated.
- **The forecast shows the first 24 supplied hourly records.** The code does not align the series to the current hour, so it should not be described as a verified next-24-hour forecast.

[The detailed data notes](docs/DATA_AND_LIMITATIONS.md) identify the owning source files and remaining engineering work. These limitations matter for product readiness; the application should not be used to make health or emergency decisions.

## Verification and next steps

On **8 November 2026**, all **21 tests**, the **TypeScript check**, and the **production build** passed on Node 24.12.0. Installation from the canonical npm lockfile succeeded with lifecycle scripts disabled. Owner-reported daily online use and manual comparisons apply to the original hosted version and are recorded separately from the revised code's automated checks. See [the verification record](docs/VERIFICATION.md) for the exact scope and remaining limitations.

The next product milestones are scientifically validated calculations, time-aligned forecasts, and real device/provider adapters if direct sensor integration is required. Broader browser, accessibility, and live-data validation remain separate from the automated checks and owner acceptance.

## Attribution and licensing

The project code is released under the [MIT License](LICENSE), copyright 2026 Emir Džumhur. The repository originated from the [Google Gemini AI Studio repository template](https://github.com/google-gemini/aistudio-repository-template). Third-party dependencies, mapping, fonts, media, and data services remain subject to their own licenses, terms, and attribution requirements.
