import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Maximize2, Minimize2 } from "lucide-react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import type { Family } from "@/data/families";
import { riskLevel, type RiskLevel } from "@/lib/risk";
import { getGoogleMapsKey } from "@/lib/maps.functions";

const COLORS: Record<RiskLevel, string> = {
  low: "#19D98B",
  medium: "#FFC83D",
  high: "#FF5263",
};

/** Estilo escuro alinhado ao Design System (fundo #0A0F1E, água #111827, vias #1C2537, rótulos #7B92B2). */
const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0A0F1E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7B92B2" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0F1E" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#111827" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1C2537" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1E2D45" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#111827" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1E2D45" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0A0F1E" }] },
];

/** Anapu-PA — centro padrão quando não há famílias. */
const FALLBACK_CENTER = { lat: -3.4892, lng: -51.1831 };

function markerIcon(level: RiskLevel): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: COLORS[level],
    fillOpacity: 1,
    scale: 7,
    strokeColor: "#0A0F1E",
    strokeWeight: 2,
  };
}

/** Google Maps real do território: marcadores por risco, cluster pulsante e InfoWindow. */
export function TerritoryMap({ families, focusId }: { families: Family[]; focusId?: string | undefined }) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Ao alternar tela cheia, o mapa precisa recalcular o tamanho e recentralizar.
  useEffect(() => {
    if (!map) return;
    const t = window.setTimeout(() => {
      google.maps.event.trigger(map, "resize");
    }, 50);
    return () => window.clearTimeout(t);
  }, [map, fullscreen]);

  // Carrega a Maps JS API uma vez e cria o mapa.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const key = await getGoogleMapsKey();
        if (cancelled) return;
        setOptions({ key });
        await importLibrary("maps");
        if (cancelled || !containerRef.current) return;
        const center =
          families.length > 0
            ? {
                lat: families.reduce((s, f) => s + f.latitude, 0) / families.length,
                lng: families.reduce((s, f) => s + f.longitude, 0) / families.length,
              }
            : FALLBACK_CENTER;
        const m = new google.maps.Map(containerRef.current, {
          center,
          zoom: 14,
          styles: DARK_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        setMap(m);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Não foi possível carregar o mapa.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marcadores e círculos derivados do estado das famílias — atualizam sem recarregar o mapa.
  useEffect(() => {
    if (!map) return;
    const markers: google.maps.Marker[] = [];
    const circles: google.maps.Circle[] = [];
    const timers: number[] = [];
    const info = new google.maps.InfoWindow();

    for (const f of families) {
      const level = riskLevel(f.riskScore);
      const marker = new google.maps.Marker({
        map,
        position: { lat: f.latitude, lng: f.longitude },
        icon: markerIcon(level),
        title: f.name,
      });
      marker.addListener("click", () => {
        info.setContent(`
          <div style="background:#111827;border:1px solid #1E2D45;border-radius:12px;padding:12px 14px;min-width:180px;font-family:Inter,sans-serif">
            <p style="margin:0;font-size:15px;font-weight:700;color:#F0F4FF">${f.name}</p>
            <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:${COLORS[level]}">Risco ${f.riskScore}</p>
            <p style="margin:4px 0 10px;font-size:13px;color:#7B92B2">${f.riskReason}</p>
            <button id="roteacs-infowin-btn" style="width:100%;height:36px;border:0;border-radius:8px;background:#16A8FF;color:#0A0F1E;font-size:13px;font-weight:700;cursor:pointer">Ver detalhes</button>
          </div>`);
        info.open({ map, anchor: marker });
        google.maps.event.addListenerOnce(info, "domready", () => {
          document.getElementById("roteacs-infowin-btn")?.addEventListener("click", () => {
            info.close();
            void navigate({ to: "/familias/$id", params: { id: f.id } });
          });
        });
      });
      markers.push(marker);

      if (f.clusterRisk) {
        const circle = new google.maps.Circle({
          map,
          center: { lat: f.latitude, lng: f.longitude },
          radius: 200,
          fillColor: "#FF5263",
          fillOpacity: 0.1,
          strokeColor: "#FF5263",
          strokeOpacity: 0.9,
          strokeWeight: 1,
        });
        circles.push(circle);
        // Anel pulsante: raio 200 → 280 → 200 em loop de 1,5 s.
        let growing = true;
        timers.push(
          window.setInterval(() => {
            growing = !growing;
            circle.setRadius(growing ? 280 : 200);
          }, 750),
        );
      }
    }

    if (focusId) {
      const focus = families.find((f) => f.id === focusId);
      if (focus) map.panTo({ lat: focus.latitude, lng: focus.longitude });
    }

    return () => {
      timers.forEach((t) => window.clearInterval(t));
      markers.forEach((m) => m.setMap(null));
      circles.forEach((c) => c.setMap(null));
      info.close();
    };
  }, [map, families, focusId, navigate]);

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "relative overflow-hidden rounded-lg border border-border"
      }
    >
      <div
        ref={containerRef}
        className={fullscreen ? "h-full w-full bg-background" : "h-64 w-full bg-background"}
        role="img"
        aria-label="Mapa do território com as famílias coloridas por prioridade"
      />
      {!map && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <p className="text-small text-muted-foreground">Carregando mapa…</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background px-6 text-center">
          <p className="text-small text-risk-high">{error}</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setFullscreen((v) => !v)}
        aria-label={fullscreen ? "Sair da tela cheia" : "Ver mapa em tela cheia"}
        className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-lg border border-border bg-card/90 text-primary shadow-sm transition-colors active:bg-elevated"
      >
        {fullscreen ? <Minimize2 className="size-5" aria-hidden /> : <Maximize2 className="size-5" aria-hidden />}
      </button>
      <div className="absolute left-2 top-2 rounded-lg bg-card/90 p-2">
        <p className="flex items-center gap-1.5 text-label text-muted-foreground">
          <span className="size-2 rounded-pill bg-risk-low" /> Monitoramento
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-label text-muted-foreground">
          <span className="size-2 rounded-pill bg-risk-medium" /> Atenção
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-label text-muted-foreground">
          <span className="size-2 animate-pulse rounded-pill bg-risk-high" /> Cluster ativo
        </p>
      </div>
    </div>
  );
}
