"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { EditeurArticle } from "./EditeurArticle";
import { categories, categorieLabel, dateLisible } from "@/lib/blog";

export type ArticleRow = {
  id: string;
  slug: string;
  titre: string;
  extrait: string;
  contenu: string;
  categorie: string;
  couverture: string | null;
  epingle: boolean;
  statut: string;
  publieLe: string | null;
  createdAt: string;
  auteurNom: string | null;
};

const STATUTS = {
  BROUILLON: { label: "Brouillon", classe: "border-warn/40 bg-warn/10 text-warn" },
  PUBLIE: { label: "Publie", classe: "border-ok/40 bg-ok/10 text-ok" },
} as const;

export function GestionArticles({ initiaux }: { initiaux: ArticleRow[] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState<string>("TOUS");
  const [filtreCategorie, setFiltreCategorie] = useState<string>("TOUTES");
  const [editeur, setEditeur] = useState<{ ouvert: boolean; article: ArticleRow | null }>(
    { ouvert: false, article: null },
  );
  const [enCours, setEnCours] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<string | null>(null);

  const visibles = useMemo(
    () =>
      initiaux
        .filter((article) => filtre === "TOUS" || article.statut === filtre)
        .filter(
          (article) =>
            filtreCategorie === "TOUTES" || article.categorie === filtreCategorie,
        ),
    [initiaux, filtre, filtreCategorie],
  );

  const compte = (statut: string) =>
    statut === "TOUS"
      ? initiaux.length
      : initiaux.filter((article) => article.statut === statut).length;

  const appeler = async (id: string, methode: "PATCH" | "DELETE", corps?: unknown) => {
    setEnCours(id);
    try {
      await fetch(`/api/articles/${id}`, {
        method: methode,
        ...(corps
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(corps),
            }
          : {}),
      });
      router.refresh();
    } finally {
      setEnCours(null);
      setASupprimer(null);
    }
  };

  const bouton =
    "flex h-11 w-11 items-center justify-center border border-line-strong transition-colors disabled:opacity-40";

  return (
    <div>
      {editeur.ouvert ? (
        <EditeurArticle
          // Remonte l'etat du formulaire quand on passe d'un article a l'autre.
          key={editeur.article?.id ?? "nouveau"}
          article={editeur.article}
          onFerme={() => setEditeur({ ouvert: false, article: null })}
          onEnregistre={() => {
            setEditeur({ ouvert: false, article: null });
            router.refresh();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditeur({ ouvert: true, article: null })}
          className="button-primary mb-6 min-h-12 px-5 text-[0.72rem]"
        >
          <Icon name="plus" className="h-4 w-4" /> Nouvel article
        </button>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["TOUS", "PUBLIE", "BROUILLON"] as const).map((statut) => (
          <button
            key={statut}
            type="button"
            onClick={() => setFiltre(statut)}
            className={`border px-3.5 py-2 text-sm font-semibold transition-colors ${
              filtre === statut
                ? "border-accent bg-accent/15 text-accent"
                : "border-line text-ink-soft hover:text-ink"
            }`}
          >
            {statut === "TOUS" ? "Tous" : STATUTS[statut].label}
            <span className="ml-1.5 opacity-60">{compte(statut)}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint">
          Categorie
        </span>
        {["TOUTES", ...categories.map((categorie) => categorie.valeur)].map((valeur) => (
          <button
            key={valeur}
            type="button"
            onClick={() => setFiltreCategorie(valeur)}
            className={`border px-3.5 py-2 text-sm font-semibold transition-colors ${
              filtreCategorie === valeur
                ? "border-accent bg-accent/15 text-accent"
                : "border-line text-ink-soft hover:text-ink"
            }`}
          >
            {valeur === "TOUTES" ? "Toutes" : categorieLabel(valeur)}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="panel p-10 text-center text-ink-soft">
          Aucun article dans cette categorie.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibles.map((article) => {
            const statut =
              STATUTS[article.statut as keyof typeof STATUTS] ?? STATUTS.BROUILLON;
            const occupe = enCours === article.id;

            return (
              <li key={article.id} className="panel p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[16rem] flex-1">
                    <p className="font-semibold">
                      {article.epingle && (
                        <Icon
                          name="pin"
                          className="mr-1.5 inline h-3.5 w-3.5 align-[-0.15em] text-accent"
                        />
                      )}
                      {article.titre}
                      <span className="ml-2 border border-line-strong px-2 py-0.5 align-middle font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
                        {categorieLabel(article.categorie)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {article.publieLe
                        ? `publie le ${dateLisible(article.publieLe)}`
                        : `cree le ${dateLisible(article.createdAt)}`}
                      {article.auteurNom && ` · par ${article.auteurNom}`}
                      {" · "}
                      <span className="font-mono text-ink-faint">/blog/{article.slug}</span>
                    </p>
                  </div>

                  <span className={`border px-2.5 py-1 text-xs font-bold ${statut.classe}`}>
                    {statut.label}
                  </span>

                  <div className="flex gap-2">
                    {article.statut === "PUBLIE" && (
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        title="Voir en ligne"
                        className={`${bouton} text-ink-soft hover:border-accent hover:text-accent`}
                      >
                        <Icon name="eye" className="h-4 w-4" />
                        <span className="sr-only">Voir en ligne</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      disabled={occupe}
                      onClick={() => appeler(article.id, "PATCH", { epingle: !article.epingle })}
                      title={article.epingle ? "Desepingler" : "Epingler"}
                      className={`${bouton} ${
                        article.epingle
                          ? "border-accent text-accent"
                          : "text-ink-soft hover:border-accent hover:text-accent"
                      }`}
                    >
                      <Icon name="pin" className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={occupe}
                      onClick={() =>
                        appeler(article.id, "PATCH", {
                          statut: article.statut === "PUBLIE" ? "BROUILLON" : "PUBLIE",
                        })
                      }
                      title={article.statut === "PUBLIE" ? "Depublier" : "Publier"}
                      className={`${bouton} ${
                        article.statut === "PUBLIE"
                          ? "text-warn hover:border-warn hover:bg-warn/10"
                          : "text-ok hover:border-ok hover:bg-ok/10"
                      }`}
                    >
                      <Icon
                        name={article.statut === "PUBLIE" ? "clock" : "check"}
                        className="h-4 w-4"
                      />
                    </button>

                    <button
                      type="button"
                      disabled={occupe}
                      onClick={() => setEditeur({ ouvert: true, article })}
                      title="Modifier"
                      className={`${bouton} text-ink-soft hover:border-accent hover:text-accent`}
                    >
                      <Icon name="pen" className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={occupe}
                      onClick={() => setASupprimer(article.id)}
                      title="Supprimer"
                      className={`${bouton} text-danger hover:border-danger hover:bg-danger/10`}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* La suppression est definitive : elle passe par une confirmation
                    en ligne plutot que par un `confirm()` du navigateur. */}
                {aSupprimer === article.id && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border border-danger/40 bg-danger/10 p-4">
                    <p className="flex-1 text-sm text-ink">
                      Supprimer definitivement « {article.titre} » ?
                    </p>
                    <button
                      type="button"
                      disabled={occupe}
                      onClick={() => appeler(article.id, "DELETE")}
                      className="min-h-11 border border-danger bg-danger/20 px-4 text-sm font-bold text-danger transition-colors hover:bg-danger/30 disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      onClick={() => setASupprimer(null)}
                      className="min-h-11 border border-line-strong px-4 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
