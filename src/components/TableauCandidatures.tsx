"use client";

import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { questionsPour } from "@/lib/questions";
import { postes, posteLabel } from "@/lib/postes";
import { AGE_ATTENDU } from "@/lib/validation";
import { ageDepuis } from "@/lib/age";

export type CandidatureRow = Record<string, string | number | null> & {
  id: string;
  poste: string;
  discordTag: string;
  prenom: string;
  dateNaissance: string;
  createdAt: string;
};

/// Un identifiant Discord numerique : il ouvre alors le profil du candidat.
const ID_DISCORD = /^\d{17,20}$/;

/// Liste des candidatures recues, en lecture seule. Accepter ou refuser se
/// fait en reagissant au message du webhook dans Discord, pas ici : le site
/// ne porte aucun statut, il n'y en aurait qu'un second a tenir a jour.
export function TableauCandidatures({ initiales }: { initiales: CandidatureRow[] }) {
  const [filtrePoste, setFiltrePoste] = useState<string>("TOUS");
  const [ouverte, setOuverte] = useState<string | null>(null);

  const visibles = useMemo(
    () =>
      initiales.filter((c) => filtrePoste === "TOUS" || c.poste === filtrePoste),
    [initiales, filtrePoste],
  );

  const comptePoste = (poste: string) =>
    poste === "TOUS"
      ? initiales.length
      : initiales.filter((c) => c.poste === poste).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint">
          Poste
        </span>
        {(["TOUS", ...postes.map((p) => p.valeur)] as const).map((valeur) => (
          <button
            key={valeur}
            type="button"
            onClick={() => setFiltrePoste(valeur)}
            className={`border px-3.5 py-2 text-sm font-semibold transition-colors ${
              filtrePoste === valeur
                ? "border-accent bg-accent/15 text-accent"
                : "border-line text-ink-soft hover:text-ink"
            }`}
          >
            {valeur === "TOUS" ? "Tous" : posteLabel(valeur)}
            <span className="ml-1.5 opacity-60">{comptePoste(valeur)}</span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="panel p-10 text-center text-ink-soft">
          Aucune candidature pour ce poste.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((candidature) => {
            const deployee = ouverte === candidature.id;

            return (
              <li
                key={candidature.id}
                className="panel overflow-hidden transition-colors hover:border-line-strong"
              >
                <div className="flex flex-wrap items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => setOuverte(deployee ? null : candidature.id)}
                    aria-expanded={deployee}
                    className="flex-1 text-left"
                  >
                    <p className="font-semibold">
                      {candidature.prenom}{" "}
                      <span className="text-ink-soft">— {candidature.discordTag}</span>
                      <span className="ml-2 border border-line-strong px-2 py-0.5 align-middle font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
                        {posteLabel(candidature.poste)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {(() => {
                        const age = ageDepuis(candidature.dateNaissance);
                        return (
                          <>
                            {age !== null && age < AGE_ATTENDU && (
                              <span className="mr-2 border border-warn/50 bg-warn/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-warn">
                                Mineur
                              </span>
                            )}
                            {age === null ? "Age inconnu" : `${age} ans`}
                          </>
                        );
                      })()}{" "}
                      · recue le{" "}
                      {new Date(candidature.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </button>

                  {ID_DISCORD.test(candidature.discordTag) && (
                    <a
                      href={`https://discord.com/users/${candidature.discordTag}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Ouvrir le profil Discord de ${candidature.prenom}`}
                      className="flex h-11 w-11 items-center justify-center border border-line-strong text-ink-soft transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon name="discord" className="h-4 w-4" />
                      <span className="sr-only">Profil Discord</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setOuverte(deployee ? null : candidature.id)}
                    aria-expanded={deployee}
                    title={deployee ? "Replier le dossier" : "Deplier le dossier"}
                    className="flex h-11 w-11 items-center justify-center border border-line-strong text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon
                      name="chevronDown"
                      className={`h-4 w-4 transition-transform ${deployee ? "rotate-180" : ""}`}
                    />
                    <span className="sr-only">
                      {deployee ? "Replier le dossier" : "Deplier le dossier"}
                    </span>
                  </button>
                </div>

                {deployee && (
                  <dl className="space-y-5 border-t border-line bg-void p-6">
                    {questionsPour(candidature.poste).map((question) => (
                      <div key={question.nom}>
                        <dt className="kicker text-[0.65rem]">
                          {question.label}
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">
                          {String(candidature[question.nom] ?? "—")}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
