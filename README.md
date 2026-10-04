# RoteACS — Community Health Agent Routing

A predictive home-visit prioritization system for Community Health Agents (ACS — Agente Comunitário de Saúde).
Developed for HackaNation (7th edition) — World Bank "Small AI for Development" Hackathon (Health track, Annex A).

## What it does

Ranks families within the ACS's territory by a RiskScore built from 6 explainable variables
(days since last visit, GI symptoms/fever, children under 5, vaccination status, cluster risk,
and — on dehydration danger signs — an urgent-referral override).
Detects spatial clusters of GI symptoms offline-capable using Haversine distance
(200m radius + shared water source) and propagates priority status to neighboring families.
The 3-step visit flow follows WHO's IMCI (Integrated Management of Childhood Illness) danger
signs, asks about WASH conditions (latrine, handwashing, water source) and priority groups
(pregnant women, chronic-disease patients), and lets the ACS answer every question either by
tapping or by voice (Small AI: closed-vocabulary Portuguese speech recognition).

## Why it is unique

Existing tools (Medic Predict, EarlyOut) require always-on connectivity to a central server.
RoteACS is **offline-first**: visits are captured and queued on the device even with no
connection, and sync automatically (visits, RiskScore recalculation, DHIS2 export) the moment
connectivity returns — no data is lost, no visit is blocked by a bad signal. Authentication and
the shared territory view require Supabase connectivity, consistent with a multi-agent system
where families belong to a real backend, not a local-only device.

## Tech Stack

- React + TanStack Start (Vite) — mobile-first web app, installable as a PWA (manifest + service
  worker; see `public/manifest.webmanifest`)
- Supabase (Auth, PostgreSQL with Row Level Security, Edge Functions)
- RiskScore engine in pure, explainable TypeScript — mirrored client-side (`src/data/families.ts`)
  and server-side (`supabase/functions/recalculate-risk`), so the agent sees the same number the
  backend computed
- Haversine cluster detection with a 200-meter radius, run inside the Edge Function
- `localStorage` offline sync queue (`roteacs_sync_queue`) + store-and-forward to Supabase and to
  the DHIS2 Tracker Events export
- Small AI layer: closed-vocabulary Portuguese speech recognition (Web Speech API today;
  isolated behind a single module, `src/lib/voice.ts`, so it can be swapped for a fully
  on-device model such as Vosk/WASM without touching any screen)

## Data Sources

| Dataset | Source | License / year | What it covers | What it does **not** cover |
|---|---|---|---|---|
| Rural household coordinates | [IBGE CNEFE 2022](https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/) | Public domain, 2022 | Real lat/lon for 50 households in Anapu, PA (IBGE code 1500859) | Not linked to real residents — family names and clinical history at those coordinates are fictitious, generated for this demo and declared as such |
| Basic Health Units (UBS) | [CNES/DATASUS](https://cnes.datasus.gov.br) | Public, 2024 | Two real, named UBS in Anapu-PA (ESF Dinora Terezinha, ESF Vila Nova Canaã) | Coordinates are approximated to the municipality centre, not the exact facility address — the CNES geolocation lookup was unreachable from our build network during development |
| Clinical danger signs | [WHO IMCI](https://www.who.int/publications/i/item/9789241508738) (Integrated Management of Childhood Illness) | Public domain | The 3 dehydration danger signs (sunken eyes, dry mouth, unusual lethargy) and the respiratory-distress question asked in the visit flow, and the +25-point urgent-referral override in the RiskScore | Not a diagnostic model — IMCI is used only to decide which yes/no questions the ACS is asked; the app never outputs a diagnosis, only a referral prompt for a human to act on |
| Portuguese speech recognition | Web Speech API (browser-native; Chrome's cloud recognition service on Android) | Vendor service, not an open dataset | Short, closed-vocabulary utterances (sim/não, water-source names, numbers 0–10, known symptom keywords) in pt-BR | **Not fully on-device/offline** — needs network for the recognition step itself (the rest of the app's offline behaviour is unaffected); accuracy across Brazilian regional accents has not been benchmarked; cannot transcribe free-form long sentences — by design, not a bug, since the vocabulary is intentionally closed |
| Family identities & visit history | Synthetic, generated for this demo | — | Realistic Pará surnames, plausible symptom/visit patterns for the demo narrative | Does **not** represent real patients or real clinical events of any kind |

## What the model does NOT detect

- Malaria (vector-borne, not waterborne)
- Tuberculosis (airborne transmission)
- Diseases without a spatial clustering pattern
- Any condition requiring imaging, lab results, or a diagnosis — RiskScore is a visit-priority
  signal, never a diagnosis (shown explicitly in the UI)

## Guardrails (Responsible AI)

- Risk score ≠ diagnosis — explicit warning in the family detail screen
- Every voice-captured answer is shown back to the ACS on a confirmation screen before saving —
  human-in-the-loop by design, not an afterthought
- Dehydration danger signs trigger an explicit "encaminhe imediatamente" referral card — the app
  never tries to resolve a severe case itself
- The ACS always decides — the app only prioritizes visit order and drafts a protocol suggestion
- Family data is scoped per agent via Postgres Row Level Security; a lost phone only exposes that
  agent's own already-synced cache, held in unencrypted `localStorage` — a known limitation, not
  hidden
- The system never acts autonomously: no visit, referral, or sync happens without the ACS's action

## Demo credentials

Agent code: `ACS001`
Password: `roteacs2026`

## How to run

```bash
bun install
bun run dev
```

Opens at `http://localhost:8080`. The `.env` file in this repo already points at the project's
Supabase instance, so no extra setup is needed.
