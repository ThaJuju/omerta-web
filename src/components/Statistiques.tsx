"use client";

import { useServerStatus } from "./ServerStatus";

export function Statistiques() {
  const statut = useServerStatus();
  const cases = [
    { valeur: statut === null ? "—" : String(statut.joueurs), label: "Joueurs connectes" },
    { valeur: statut === null ? "—" : String(statut.max), label: "Capacite de la ville" },
    { valeur: "24/7", label: "Ville accessible" },
    { valeur: "FR", label: "Communaute" },
  ];

  return (
    <section aria-label="Statistiques du serveur" className="relative z-10 mx-auto -mt-8 w-[calc(100%-2.5rem)] max-w-[1340px] border border-line-strong bg-bg/95 shadow-2xl backdrop-blur-xl sm:-mt-10">
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {cases.map((item, index) => (
          <div key={item.label} className="relative px-5 py-7 sm:px-8 sm:py-9 lg:border-r lg:border-line last:lg:border-r-0">
            <span className="absolute left-4 top-4 font-mono text-[0.58rem] text-ink-faint">0{index + 1}</span>
            <p className="tabular text-center text-3xl font-medium text-ink sm:text-4xl">{item.valeur}</p>
            <p className="mt-2 text-center font-mono text-[0.65rem] uppercase tracking-[0.13em] text-ink-faint">{item.label}</p>
            <div className="mx-auto mt-4 h-0.5 w-7 bg-accent" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
