ALTER TABLE public.families
  ADD COLUMN IF NOT EXISTS has_pregnant boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_chronic boolean NOT NULL DEFAULT false;
ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS visit_reasons text[],
  ADD COLUMN IF NOT EXISTS symptoms text[],
  ADD COLUMN IF NOT EXISTS fever_symptom boolean,
  ADD COLUMN IF NOT EXISTS symptom_duration integer,
  ADD COLUMN IF NOT EXISTS dehydration_signs text[],
  ADD COLUMN IF NOT EXISTS wash_latrine boolean,
  ADD COLUMN IF NOT EXISTS wash_latrine_condition text,
  ADD COLUMN IF NOT EXISTS wash_handwashing boolean,
  ADD COLUMN IF NOT EXISTS wash_soap boolean,
  ADD COLUMN IF NOT EXISTS wash_trash boolean,
  ADD COLUMN IF NOT EXISTS vaccines_status text,
  ADD COLUMN IF NOT EXISTS vaccines_late text,
  ADD COLUMN IF NOT EXISTS prenatal_weeks integer,
  ADD COLUMN IF NOT EXISTS prenatal_consults integer,
  ADD COLUMN IF NOT EXISTS bp_systolic integer,
  ADD COLUMN IF NOT EXISTS bp_diastolic integer,
  ADD COLUMN IF NOT EXISTS chronic_meds text,
  ADD COLUMN IF NOT EXISTS glucose_mgdl integer,
  ADD COLUMN IF NOT EXISTS urgent_referral boolean NOT NULL DEFAULT false;