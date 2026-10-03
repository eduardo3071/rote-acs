# RoteACS — Community Health Agent Routing

A predictive home-visit prioritization system for Community Health Agents (CHAs).
Developed for HackaNation (7th edition) — World Bank "Small AI for Development" (Health) track.

## What it does

Ranks families within the CHA's territory based on a locally calculated risk score,
prioritizing those at highest risk before health issues escalate to the point of requiring a clinic visit.
Detects spatial clusters of diarrhea and fever offline using Haversine distance
(200m radius + shared water source) and propagates priority status to neighboring families in real-time.

## Why it is unique

Existing tools (Medic Predict, EarlyOut) require an external server.
RoteACS runs 100% offline on the CHA's device — no cloud, no connectivity required.

## Tech Stack

- React Native + Expo
- Supabase (auth, PostgreSQL, Edge Functions)
- RiskScore engine in pure JavaScript (no external ML model)
- Haversine cluster detection with a 200-meter radius
- Local SQLite + store-and-forward for DHIS2

## Data Sources

| Data | Source | License |
|---|---|---|
| Rural household coordinates | IBGE CNEFE 2022 | Public Domain |
| Basic Health Units (UBS) | CNES/DATASUS 2024 | Public Domain |
| Family names | Fictitious — preserves statistical confidentiality | — |
| Clinical protocols | IMCI/WHO | Public Domain |

Coordinates extracted from the municipality of Anapu, Pará (IBGE code 1500859),
a remote region in Pará with a history of waterborne disease outbreaks. ## What the model does NOT detect

- Malaria (vector-borne, not waterborne)
- Tuberculosis (airborne transmission)
- Diseases without a spatial clustering pattern

## Guardrails

- Risk score ≠ diagnosis (explicit warning in the interface)
- The CHW decides — the app only prioritizes the visit order
- Family data remains on the device; synchronization is opt-in
- The model does not act autonomously in any scenario

## Demo credentials

Agent code: ACS001
Password: roteacs2026

## How to run

npx expo start --tunnel
