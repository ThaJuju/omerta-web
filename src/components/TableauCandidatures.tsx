"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { questionsPour } from "@/lib/questions";
import { postes, posteLabel } from "@/lib/postes";

export type CandidatureRow = Record<string, string | number | null> & {
  id: string;
  status: string;
  poste: string;
  discordTag: string;
  prenom: string;
  age: number;
  createdAt: string;
  noteStaff: string | null;
  reviewerNom: string | null;
};

const STATUTS = {
  EN_ATTENTE: { label: "En attente", classe: "border-warn/40 bg-warn/10 text-warn" },
  ACCEPTEE: { label: "Acceptee", classe: "border-ok/40 bg-ok/10 text-ok" },
  REFUSEE: { label: "Refusee", classe: "border-danger/40 bg-danger/10 text-danger" },
} as const;


export function TableauCandidatures({ initiales }: { initiales: CandidatureRow[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<string>("EN_ATTENTE");
  const [filtrePoste, setFiltrePoste] = useState<string>("TOUS");
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const visibles = useMemo(
    () =>
      initiales
        .filter((c) => filtre === "TOUTES" || c.status === filtre)
        .filter((c) => filtrePoste === "TOUS" || c.poste === filtrePoste),
    [initiales, filtre, filtrePoste],
  );

  const comptePoste = (poste: string) =>
    poste === "TOUS"
      ? initiales.length
      : initiales.filter((c) => c.poste === poste).length;

  const compte = (statut: string) =>
    statut === "TOUTES"
      ? initiales.length
      : initiales.filter((c) => c.status === statut).length;

  const changerStatut = async (id: string, status: string) => {
    setEnCours(id);
    try {
      await fetch(`/api/candidatures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setEnCours(null);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {(["EN_ATTENTE", "ACCEPTEE", "REFUSEE", "TOUTES"] as const).map((statut) => (
          <button
            key={statut}
            type="button"
            onClick={() => setFiltre(statut)}
            className={` border px-3.5 py-2 text-sm font-semibold transition-colors ${
              filtre === statut
                ? "border-accent bg-accent/15 text-accent"
                : "border-line text-ink-soft hover:text-ink"
            }`}
          >
            {statut === "TOUTES"
              ? "Toutes"
              : STATUTS[statut as keyof typeof STATUTS].label}
            <span className="ml-1.5 opacity-60">{compte(statut)}</span>
          </button>
        ))}
      </div>

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
          Aucune candidature dans cette categorie.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((candidature) => {
            const statut =
              STATUTS[candidature.status as keyof typeof STATUTS] ?? STATUTS.EN_ATTENTE;
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
                      {candidature.age} ans · recue le{" "}
                      {new Date(candidature.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {candidature.reviewerNom && ` · traitee par ${candidature.reviewerNom}`}
                    </p>
                  </button>

                  <span
                    className={` border px-2.5 py-1 text-xs font-bold ${statut.classe}`}
                  >
                    {statut.label}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={enCours === candidature.id}
                      onClick={() => changerStatut(candidature.id, "ACCEPTEE")}
                      title="Accepter"
                      className="flex h-11 w-11 items-center justify-center border border-line-strong text-ok transition-colors hover:border-ok hover:bg-ok/10 disabled:opacity-40"
                    >
                      <Icon name="check" />
                    </button>
                    <button
                      type="button"
                      disabled={enCours === candidature.id}
                      onClick={() => changerStatut(candidature.id, "REFUSEE")}
                      title="Refuser"
                      className="flex h-11 w-11 items-center justify-center border border-line-strong text-danger transition-colors hover:border-danger hover:bg-danger/10 disabled:opacity-40"
                    >
                      <Icon name="cross" />
                    </button>
                  </div>
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
