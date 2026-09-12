"use client";

import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { slugifier, tempsLecture } from "@/lib/blog";
import { rendreMarkdown } from "@/lib/markdown";
import type { ArticleRow } from "./GestionArticles";

export type Brouillon = {
  titre: string;
  slug: string;
  extrait: string;
  contenu: string;
  couverture: string;
  epingle: boolean;
  statut: string;
};

const VIDE: Brouillon = {
  titre: "",
  slug: "",
  extrait: "",
  contenu: "",
  couverture: "",
  epingle: false,
  statut: "BROUILLON",
};

const depuis = (article: ArticleRow | null): Brouillon =>
  article
    ? {
        titre: article.titre,
        slug: article.slug,
        extrait: article.extrait,
        contenu: article.contenu,
        couverture: article.couverture ?? "",
        epingle: article.epingle,
        statut: article.statut,
      }
    : VIDE;

/// Formulaire de redaction. Sert a la creation comme a la modification :
/// `article` a null signifie « nouvel article ».
export function EditeurArticle({
  article,
  onFerme,
  onEnregistre,
}: {
  article: ArticleRow | null;
  onFerme: () => void;
  onEnregistre: () => void;
}) {
  const [valeurs, setValeurs] = useState<Brouillon>(() => depuis(article));
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [apercu, setApercu] = useState(false);

  // Le slug ne suit le titre que tant qu'il n'a pas ete edite a la main, et
  // jamais sur un article deja publie : son URL circule peut-etre deja.
  const [slugAuto, setSlugAuto] = useState(article === null);

  const html = useMemo(() => rendreMarkdown(valeurs.contenu), [valeurs.contenu]);

  const modifier = (champ: keyof Brouillon, valeur: string | boolean) =>
    setValeurs((actuel) => ({ ...actuel, [champ]: valeur }));

  const modifierTitre = (titre: string) => {
    setValeurs((actuel) => ({
      ...actuel,
      titre,
      slug: slugAuto ? slugifier(titre) : actuel.slug,
    }));
  };

  const enregistrer = async (statut: string) => {
    setEnvoi(true);
    setErreurs({});
    setMessage(null);

    const corps = {
      ...valeurs,
      statut,
      couverture: valeurs.couverture.trim(),
      slug: valeurs.slug.trim() || slugifier(valeurs.titre),
    };

    try {
      const reponse = await fetch(
        article ? `/api/articles/${article.id}` : "/api/articles",
        {
          method: article ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corps),
        },
      );

      if (reponse.ok) {
        onEnregistre();
        return;
      }

      const donnees = await reponse.json().catch(() => null);
      setErreurs(donnees?.erreurs ?? {});
      setMessage(donnees?.message ?? "Enregistrement impossible.");
    } catch {
      setMessage("Le serveur ne repond pas.");
    } finally {
      setEnvoi(false);
    }
  };

  const erreur = (champ: string) =>
    erreurs[champ] ? (
      <p className="mt-1.5 text-xs text-danger">{erreurs[champ]}</p>
    ) : null;

  const label = "mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint";

  return (
    <div className="panel mb-6 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-2xl">
          {article ? "Modifier l'article" : "Nouvel article"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setApercu((v) => !v)}
            className="flex min-h-11 items-center gap-2 border border-line-strong px-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name="eye" className="h-4 w-4" />
            {apercu ? "Editer" : "Apercu"}
          </button>
          <button
            type="button"
            onClick={onFerme}
            className="flex h-11 w-11 items-center justify-center border border-line-strong text-ink-soft transition-colors hover:border-danger hover:text-danger"
            title="Fermer"
          >
            <Icon name="cross" className="h-4 w-4" />
            <span className="sr-only">Fermer l&apos;editeur</span>
          </button>
        </div>
      </div>

      {message && (
        <p className="mb-5 border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {message}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className={label} htmlFor="titre">
            Titre
          </label>
          <input
            id="titre"
            className="field"
            value={valeurs.titre}
            maxLength={140}
            aria-invalid={Boolean(erreurs.titre)}
            onChange={(evenement) => modifierTitre(evenement.target.value)}
          />
          {erreur("titre")}
        </div>

        <div>
          <label className={label} htmlFor="slug">
            Slug — /blog/{valeurs.slug || "…"}
          </label>
          <input
            id="slug"
            className="field font-mono text-sm"
            value={valeurs.slug}
            maxLength={80}
            aria-invalid={Boolean(erreurs.slug)}
            onChange={(evenement) => {
              setSlugAuto(false);
              modifier("slug", evenement.target.value);
            }}
          />
          {erreur("slug")}
        </div>

        <div className="lg:col-span-2">
          <label className={label} htmlFor="couverture">
            Image de couverture (URL, facultatif)
          </label>
          <input
            id="couverture"
            className="field font-mono text-sm"
            placeholder="https://…"
            value={valeurs.couverture}
            aria-invalid={Boolean(erreurs.couverture)}
            onChange={(evenement) => modifier("couverture", evenement.target.value)}
          />
          {erreur("couverture")}
        </div>

        <div className="lg:col-span-2">
          <label className={label} htmlFor="extrait">
            Extrait — {valeurs.extrait.length}/320
          </label>
          <textarea
            id="extrait"
            className="field"
            rows={2}
            maxLength={320}
            value={valeurs.extrait}
            aria-invalid={Boolean(erreurs.extrait)}
            onChange={(evenement) => modifier("extrait", evenement.target.value)}
          />
          {erreur("extrait")}
        </div>

        <div className="lg:col-span-2">
          <label className={label} htmlFor="contenu">
            Contenu — Markdown · {tempsLecture(valeurs.contenu)} min de lecture
          </label>
          {apercu ? (
            <div
              className="prose-omerta border border-line-strong bg-void p-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <textarea
              id="contenu"
              className="field font-mono text-sm leading-relaxed"
              rows={18}
              value={valeurs.contenu}
              aria-invalid={Boolean(erreurs.contenu)}
              onChange={(evenement) => modifier("contenu", evenement.target.value)}
            />
          )}
          {erreur("contenu")}
          <p className="mt-2 text-xs text-ink-faint">
            # Titre · **gras** · *italique* · - liste · &gt; citation ·
            [lien](https://…) · ![image](https://…) · --- separateur
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft lg:col-span-2">
          <input
            type="checkbox"
            checked={valeurs.epingle}
            onChange={(evenement) => modifier("epingle", evenement.target.checked)}
            className="h-4 w-4 accent-[#ff641e]"
          />
          Epingler en tete de liste
        </label>
      </div>

      <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
        <button
          type="button"
          disabled={envoi}
          onClick={() => enregistrer("PUBLIE")}
          className="button-primary min-h-12 px-5 text-[0.72rem] disabled:opacity-50"
        >
          <Icon name="check" className="h-4 w-4" />
          {article?.statut === "PUBLIE" ? "Enregistrer" : "Publier"}
        </button>
        <button
          type="button"
          disabled={envoi}
          onClick={() => enregistrer("BROUILLON")}
          className="button-secondary min-h-12 px-5 text-[0.72rem] disabled:opacity-50"
        >
          Enregistrer en brouillon
        </button>
      </div>
    </div>
  );
}
