"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { etapesPour } from "@/lib/questions";
import { postes, type Poste } from "@/lib/postes";
import { candidatureSchema, AGE_ATTENDU } from "@/lib/validation";
import { ageDepuis } from "@/lib/age";

type Valeurs = Record<string, string>;
type Erreurs = Record<string, string>;

export function FormulaireCandidature() {
  const [etape, setEtape] = useState(0);
  const [valeurs, setValeurs] = useState<Valeurs>({ poste: "" });

  // Le parcours depend du poste : les deux equipes ne posent pas les memes
  // questions. Tant qu'aucun poste n'est choisi, seule l'etape 0 existe.
  const parcours = useMemo(
    () => (valeurs.poste ? etapesPour(valeurs.poste as Poste) : []),
    [valeurs.poste],
  );

  const titres = ["Poste vise", ...parcours.map((e) => e.titre)];
  const questionsEtape = etape === 0 ? [] : (parcours[etape - 1]?.questions ?? []);
  const total = parcours.length + 1;
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  const modifier = (nom: string, valeur: string) => {
    setValeurs((precedent) => ({ ...precedent, [nom]: valeur }));
    setErreurs((precedent) => {
      if (!precedent[nom]) return precedent;
      const suivant = { ...precedent };
      delete suivant[nom];
      return suivant;
    });
  };

  /// Valide uniquement les champs de l'etape courante, en reutilisant le
  /// meme schema Zod que le serveur.
  const validerEtape = (index: number): boolean => {
    if (index === 0) {
      if (valeurs.poste) return true;
      setErreurs({ poste: "Choisissez le poste vise." });
      return false;
    }

    const resultat = candidatureSchema.safeParse(valeurs);
    if (resultat.success) return true;

    const champsEtape = (parcours[index - 1]?.questions ?? []).map((q) => q.nom);
    const trouvees: Erreurs = {};

    for (const probleme of resultat.error.issues) {
      const champ = String(probleme.path[0]);
      if (champsEtape.includes(champ) && !trouvees[champ]) {
        trouvees[champ] = probleme.message;
      }
    }

    if (Object.keys(trouvees).length === 0) return true;

    setErreurs(trouvees);
    document
      .querySelector<HTMLElement>(`[name="${Object.keys(trouvees)[0]}"]`)
      ?.focus();
    return false;
  };

  const suivant = () => {
    if (!validerEtape(etape)) return;
    setEtape((precedent) => precedent + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const precedent = () => {
    setEtape((valeur) => Math.max(0, valeur - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const envoyer = async () => {
    if (!validerEtape(etape)) return;

    setEnvoi(true);
    setErreurGlobale(null);

    try {
      const reponse = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valeurs),
      });

      const data = await reponse.json();

      if (!reponse.ok) {
        // Le serveur renvoie les erreurs par champ : on retourne a l'etape fautive.
        if (data.erreurs) {
          setErreurs(data.erreurs);
          const premierChamp = Object.keys(data.erreurs)[0];
          const indexEtape = parcours.findIndex((e) =>
            e.questions.some((q) => q.nom === premierChamp),
          );
          if (indexEtape !== -1) setEtape(indexEtape + 1);
        }
        setErreurGlobale(data.message || "La candidature n'a pas pu etre envoyee.");
        return;
      }

      setEnvoye(true);
    } catch {
      setErreurGlobale("Connexion impossible. Reessayez dans un instant.");
    } finally {
      setEnvoi(false);
    }
  };

  if (envoye) {
    return (
      <div className="panel border-t-2 border-t-ok p-10 text-center sm:p-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-ok/40 bg-ok/10">
          <Icon name="check" className="h-7 w-7 text-ok" />
        </div>
        <h2 className="mt-5 display text-3xl">
          Candidature envoyee
        </h2>
        <p className="mt-3 text-ink-soft">
          L&apos;equipe a bien recu votre dossier. La reponse vous sera communiquee
          directement sur Discord. Pensez a garder vos messages prives ouverts.
        </p>
        <Link
          href="/"
          className="button-secondary mt-9"
        >
          <Icon name="arrowLeft" />
          Retour a l&apos;accueil
        </Link>
      </div>
    );
  }

  const derniere = etape > 0 && etape === parcours.length;

  return (
    <div className="panel border-t-2 border-t-accent p-6 sm:p-10">
      <p className="kicker">Recrutement · Staff & Animateurs</p>
      <h1 className="display mt-3 text-[clamp(2rem,5vw,3rem)]">
        {titres[etape]}
      </h1>

      <ol className="mt-8 flex gap-3" aria-label="Progression">
        {titres.map((titre, index) => (
          <li key={titre} className="flex-1">
            <div
              className={`h-px transition-colors duration-300 ${
                index <= etape ? "bg-accent" : "bg-line-strong"
              }`}
            />
            <p
              className={`tabular mt-3 text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                index <= etape ? "text-accent" : "text-ink-faint"
              }`}
            >
              {String(index + 1).padStart(2, "0")}
              <span className="hidden sm:inline"> · {titre}</span>
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-7 space-y-5">
        {etape === 0 && (
          <fieldset>
            <legend className="sr-only">Poste vise</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {postes.map((poste) => {
                const choisi = valeurs.poste === poste.valeur;
                return (
                  <label
                    key={poste.valeur}
                    className={`cursor-pointer border p-5 transition-colors ${
                      choisi
                        ? "border-accent bg-accent/10"
                        : "border-line-strong hover:border-line-strong hover:bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="poste"
                      value={poste.valeur}
                      checked={choisi}
                      onChange={() => modifier("poste", poste.valeur)}
                      className="sr-only"
                    />
                    <span className="flex items-center justify-between gap-3">
                      <span className="display text-2xl">{poste.label}</span>
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          choisi ? "border-accent bg-accent" : "border-line-strong"
                        }`}
                      >
                        {choisi && <Icon name="check" className="h-3 w-3 text-void" />}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm font-medium text-ink-soft">
                      {poste.resume}
                    </span>
                    <span className="mt-3 block text-sm leading-relaxed text-ink-faint">
                      {poste.detail}
                    </span>
                  </label>
                );
              })}
            </div>
            {erreurs.poste && (
              <p role="alert" className="mt-3 text-xs text-danger">
                {erreurs.poste}
              </p>
            )}
          </fieldset>
        )}

        {questionsEtape.map((question) => {
          const erreur = erreurs[question.nom];
          const idErreur = `${question.nom}-erreur`;

          return (
            <div key={question.nom}>
              <label
                htmlFor={question.nom}
                className="mb-2 block text-sm font-medium text-ink"
              >
                {question.label}
              </label>

              {question.type === "textarea" ? (
                <textarea
                  id={question.nom}
                  name={question.nom}
                  rows={4}
                  className="field resize-y"
                  placeholder={question.placeholder}
                  value={valeurs[question.nom]}
                  aria-invalid={erreur ? true : undefined}
                  aria-describedby={erreur ? idErreur : undefined}
                  onChange={(event) => modifier(question.nom, event.target.value)}
                />
              ) : (
                <input
                  id={question.nom}
                  name={question.nom}
                  type={question.type}
                  inputMode={question.type === "number" ? "numeric" : undefined}
                  className="field"
                  placeholder={question.placeholder}
                  value={valeurs[question.nom]}
                  aria-invalid={erreur ? true : undefined}
                  aria-describedby={erreur ? idErreur : undefined}
                  onChange={(event) => modifier(question.nom, event.target.value)}
                />
              )}

              {question.nom === "dateNaissance" &&
                (() => {
                  const age = ageDepuis(valeurs.dateNaissance);
                  if (age === null) return null;
                  return (
                    <p className="mt-2 border-l-2 border-line-strong px-3 py-2 text-xs leading-relaxed text-ink-soft">
                      Soit <strong className="text-ink">{age} ans</strong>.
                      {age < AGE_ATTENDU && (
                        <span className="mt-1 block text-warn">
                          Vous avez moins de {AGE_ATTENDU} ans. Votre candidature
                          sera transmise et etudiee, mais l&apos;equipe est en
                          principe reservee aux majeurs.
                        </span>
                      )}
                    </p>
                  );
                })()}

              {question.aide && !erreur && (
                <p className="mt-1.5 text-xs text-ink-soft">{question.aide}</p>
              )}
              {erreur && (
                <p id={idErreur} role="alert" className="mt-1.5 text-xs text-danger">
                  {erreur}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {erreurGlobale && (
        <p
          role="alert"
          className="mt-6 border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {erreurGlobale}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={precedent}
          disabled={etape === 0}
          className="button-secondary disabled:pointer-events-none disabled:opacity-30"
        >
          <Icon name="arrowLeft" />
          Retour
        </button>

        <button
          type="button"
          onClick={derniere ? envoyer : suivant}
          disabled={envoi}
          className="button-primary disabled:pointer-events-none disabled:opacity-50"
        >
          {envoi ? "Envoi en cours..." : derniere ? "Envoyer ma candidature" : "Continuer"}
          {!envoi && <Icon name={derniere ? "check" : "arrowRight"} />}
        </button>
      </div>
    </div>
  );
}
