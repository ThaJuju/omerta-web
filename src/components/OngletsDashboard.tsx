"use client";

import { useState } from "react";
import { Icon, type IconName } from "./Icon";

type Onglet = {
  cle: string;
  label: string;
  icon: IconName;
  compte: number;
  contenu: React.ReactNode;
};

/// Onglets du dashboard staff. Les contenus sont rendus cote serveur et passes
/// en props : basculer d'un onglet a l'autre ne declenche aucune requete.
export function OngletsDashboard({ onglets }: { onglets: Onglet[] }) {
  const [actif, setActif] = useState(onglets[0]?.cle);

  return (
    <div>
      <div role="tablist" className="mb-7 flex flex-wrap gap-px border-b border-line">
        {onglets.map((onglet) => (
          <button
            key={onglet.cle}
            type="button"
            role="tab"
            id={`onglet-${onglet.cle}`}
            aria-selected={actif === onglet.cle}
            aria-controls={`panneau-${onglet.cle}`}
            onClick={() => setActif(onglet.cle)}
            className={`-mb-px flex min-h-12 items-center gap-2.5 border-b-2 px-5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
              actif === onglet.cle
                ? "border-accent text-accent"
                : "border-transparent text-ink-faint hover:text-ink"
            }`}
          >
            <Icon name={onglet.icon} className="h-4 w-4" />
            {onglet.label}
            <span className="opacity-60">{onglet.compte}</span>
          </button>
        ))}
      </div>

      {onglets.map((onglet) => (
        <div
          key={onglet.cle}
          role="tabpanel"
          id={`panneau-${onglet.cle}`}
          aria-labelledby={`onglet-${onglet.cle}`}
          hidden={actif !== onglet.cle}
        >
          {onglet.contenu}
        </div>
      ))}
    </div>
  );
}
