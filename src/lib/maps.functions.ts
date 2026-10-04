import { createServerFn } from "@tanstack/react-start";

/**
 * Entrega a chave do Google Maps ao navegador. Chaves de mapa são públicas por
 * natureza (ficam visíveis no navegador de qualquer forma) — a restrição de
 * domínio/referrer no Google Cloud é o que protege a chave.
 */
export const getGoogleMapsKey = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["GOOGLE_API_KEY"];
  if (!key) throw new Error("Chave do Google Maps não configurada.");
  return key;
});
