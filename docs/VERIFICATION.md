# Verification record

**Review date:** 8 November 2026

**Source baseline:** `6e65d8e` (`feat: initialize Sarajevo Air Watch application`)

**Release under review:** Sarajevo Air Watch `0.1.0`, the public-use revision prepared on the review date. This revision adds data-provenance labels, response/input validation, encoded tooltips, attribution, clearer prototype guidance, a reproducible npm dependency setup, documentation, and an MIT license. The original export is preserved separately.

## Checks performed

| Check | Result | What it establishes |
| --- | --- | --- |
| Checkout state before documentation edits | Clean | No existing local edits were overwritten. |
| Source and configuration inspection | Completed | README feature, data-source, storage, and environment descriptions were checked against the source. |
| `node --version` | `v24.12.0` | Runtime used for the test command below. |
| `npm ci --ignore-scripts --no-audit --no-fund` | **Passed; 182 packages installed** | Installation from the canonical npm lockfile succeeded without running dependency lifecycle scripts. |
| `npm ls --depth=0` | **Passed** | The installed direct dependency tree resolves without invalid-package errors. |
| `npm test` | **21 passed, 0 failed, 0 skipped** | Six calculation, ten provenance/input/data-flow, and five tooltip tests pass. |
| `npm run lint` | **Passed; `tsc --noEmit`, exit 0** | The current public-use revision passes its TypeScript check. |
| `npm run build` | **Passed; Vite 8.3.6 transformed 1,675 modules** | The current revision produces a production bundle in `dist/`. |
| Documentation references and feature count | **16 relative links resolve; 12 predefined locations confirmed** | Linked local files exist and the location count matches the source. |
| Owner-supplied AI Studio export compared with repository | **All 28 tracked files match `6e65d8e` byte for byte** | The supplied export contains the same application source, manifest, lockfile, configuration, and images. Its only additional root file is the generic AI Studio README. |

The tests cover selected AQI/episode/inversion outputs, manual-input and stored-record validation, labelled fallback behavior, successful and malformed mocked API responses, and tooltip encoding. Mocked responses establish handling of those test cases; they do not establish live provider availability, browser rendering, scientific accuracy, or regulatory compliance.

## Owner-reported live use

The project owner explicitly confirmed daily use of the original hosted application, working API/sensor connections, and up-to-date information. He reported manually comparing the display with news reports and the providers' own websites, finding that they matched, and accepted the application as working as designed. This is **USER-TESTED: owner-reported online testing and acceptance of the original hosted version**, recorded separately from the reviewer's automated and source-level checks. The newly prepared public-use revision has not yet received that same online user acceptance.

The supplied export matches the original repository baseline. Its source contains Open-Meteo requests but no separate FHMZ, U.S. Embassy, Eko Akcija, Sensor.Community, or PurpleAir adapters; its custom-sensor connection action validates entered values without a network request. The owner's report provides practical acceptance evidence. It does not identify the underlying network route for each displayed provider, which remains independently unverified. Confirming that distinction requires inspection of actual hosted network traffic and any separate infrastructure. The public-use revision labels the implemented routes and manual-entry behavior explicitly.

## Export identity

The owner-supplied `sarajevo-air-watch.zip` was preserved and extracted into an isolated review directory after checking archive entry paths and symlink attributes. No unsafe entries were detected.

SHA-256:

```text
27F15F0FE2E5AFB1236721FBB65D830615C7C7B2C387081072E58999A53EEB4E
```

## Dependency reproducibility

The original manifest locked esbuild 0.25.12, while the locked Vite version required optional peer esbuild `^0.27.0 || ^0.28.0`. npm rejected that combination. The public-use revision changes the esbuild constraint to `^0.28.2`; other existing dependency constraints are retained. A canonical npm lockfile replaces the old Bun lockfile, which remains available in the preserved export and original Git history.

The npm v3 lockfile contains 268 package entries, all resolved tarball URLs pointing to `https://registry.npmjs.org/`. Installation was run with `--ignore-scripts`; dependency lifecycle scripts were not executed. This records provenance and install behavior, not a full vulnerability audit. The build succeeds without those install scripts.

A local Bun 1.4.4 binary was obtained from the official `@oven/bun-windows-x64` npm package and its archive SHA-512 matched registry metadata. Its installer failed with `EBADF` for the temporary directory in this Windows environment, including with explicit local temporary paths. No global tool installation or persistence was added. npm provides the verified project setup instead.

The production build currently emits a non-fatal Vite warning that `__dirname` in `vite.config.ts` will not be supported by the planned future native config loader. It does not prevent the current Vite 8.3.6 build.

The TypeScript check initially exposed an inferred `null`/`never` result in the existing canton-summary memo. An explicit result type fixes that error without changing the aggregation formulas or runtime behavior. The final test, TypeScript, and build commands all passed after that change.

## Not independently verified in this review

- Browser rendering, responsiveness, accessibility, or cross-browser support.
- Live Open-Meteo responses, rate-limit behavior, and upstream schema changes. Failure and malformed-response handling are covered with mocked responses.
- Physical sensor connectivity, telemetry ingestion, and provider-specific adapters; these are not implemented in the reviewed source.
- Hosted app operation. Read-only web access could not inspect the supplied AI Studio URL. A separate browser check reached Google AI Studio onboarding and terms rather than the project; those terms were not accepted during the review.
- A complete security audit, third-party usage rights, and correctness of health or regulatory guidance. Input validation and tooltip encoding are bounded implemented/tested measures.

## Reproduction

From the repository root, use Node 24 and npm:

```sh
npm ci --ignore-scripts
npm test
npm run lint
npm run build
```

The `lint` script is a TypeScript no-emit check. Browser and live-data checks should separately record the tested environment, data provenance, and observed results. A passing production build is not a hosted deployment confirmation.
