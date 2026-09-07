"use client";

import { useSyncExternalStore } from "react";

export type Statut = { online: boolean; joueurs: number; max: number };

const HORS_LIGNE: Statut = { online: false, joueurs: 0, max: 0 };
const INTERVALLE = 30_000;
const AGE_MAX = 15_000;

/* ── Sonde unique et partagee ──────────────────────────────────────────────
   Un seul sondage alimente tous les composants, au lieu d'un par composant.
   Le rafraichissement est relance des que la page redevient visible : sans
   cela, un retour arriere restaure la page depuis le cache du navigateur
   sans rejouer les effets, et les compteurs restaient figes. */

let statut: Statut | null = null;
let derniere = 0;
let enVol: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const abonnes = new Set<() => void>();

function diffuser() {
  for (const notifier of abonnes) notifier();
}

function recuperer(force = false): Promise<void> {
  if (enVol) return enVol;
  if (!force && Date.now() - derniere < AGE_MAX) return Promise.resolve();

  enVol = (async () => {
    try {
      const reponse = await fetch("/api/server-status", { cache: "no-store" });
      const data = (await reponse.json()) as Statut;
      // Nouvelle reference uniquement si la valeur a change : evite les
      // rendus inutiles a chaque sondage.
      if (
        !statut ||
        statut.online !== data.online ||
        statut.joueurs !== data.joueurs ||
        statut.max !== data.max
      ) {
        statut = data;
        diffuser();
      }
    } catch {
      if (statut?.online !== false) {
        statut = HORS_LIGNE;
        diffuser();
      }
    } finally {
      derniere = Date.now();
      enVol = null;
    }
  })();

  return enVol;
}

function visible() {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

/// Sonde uniquement quand l'onglet est au premier plan : en arriere-plan les
/// navigateurs bride `setInterval`, autant ne pas s'y fier.
function planifier() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (visible()) recuperer();
  }, INTERVALLE);
}

function reveil() {
  if (visible()) recuperer(true);
}

function demarrer() {
  recuperer(true);
  planifier();
  document.addEventListener("visibilitychange", reveil);
  window.addEventListener("pageshow", reveil); // restauration depuis le bfcache
  window.addEventListener("online", reveil);
}

function arreter() {
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", reveil);
  window.removeEventListener("pageshow", reveil);
  window.removeEventListener("online", reveil);
}

function abonner(notifier: () => void) {
  abonnes.add(notifier);
  if (abonnes.size === 1) demarrer();

  return () => {
    abonnes.delete(notifier);
    if (abonnes.size === 0) arreter();
  };
}

export function useServerStatus(): Statut | null {
  return useSyncExternalStore(
    abonner,
    () => statut,
    () => null, // rendu serveur : aucune donnee, la valeur arrive au montage
  );
}

/// Pastille d'etat compacte, posee sur le hero.
export function ServerStatus() {
  const statut = useServerStatus();
  const enLigne = statut?.online ?? false;

  return (
    <div
      aria-live="polite"
      className="inline-flex items-center gap-3 border border-line-strong bg-void/60 px-4 py-2.5 backdrop-blur-sm"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {enLigne && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${enLigne ? "bg-ok" : "bg-danger"}`}
        />
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.18em]">
        {statut === null ? "Connexion" : enLigne ? "Serveur en ligne" : "Hors ligne"}
      </span>
      {statut?.online && (
        <span className="tabular border-l border-line-strong pl-3 text-xs text-accent">
          {statut.joueurs}/{statut.max}
        </span>
      )}
    </div>
  );
}
