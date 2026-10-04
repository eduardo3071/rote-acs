ALTER TABLE public.families ADD COLUMN municipio text, ADD COLUMN cod_ibge text;
UPDATE public.families SET municipio = 'Anapu', cod_ibge = '1500859' WHERE cod_ibge IS NULL;
CREATE INDEX families_acs_cod_ibge_idx ON public.families (acs_id, cod_ibge);
GRANT UPDATE (municipio, cod_ibge) ON public.acs TO authenticated;
CREATE POLICY acs_update_self_territory ON public.acs FOR UPDATE TO authenticated
  USING (auth.email() = (lower(code) || '@roteacs.app'))
  WITH CHECK (auth.email() = (lower(code) || '@roteacs.app'));