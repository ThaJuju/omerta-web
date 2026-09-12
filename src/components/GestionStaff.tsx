"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { roleLabel } from "@/lib/staff";
import { ROLES } from "@/lib/validation";

export type StaffRow = {
  id: string;
  username: string;
  role: string;
  approved: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

const date = (valeur: string) =>
  new Date(valeur).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function GestionStaff({
  initiaux,
  moiId,
}: {
  initiaux: StaffRow[];
  moiId: string;
}) {
  const router = useRouter();
  const [creation, setCreation] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("MODERATEUR");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const [enCours, setEnCours] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const [aReinitialiser, setAReinitialiser] = useState<string | null>(null);
  const [nouveauMdp, setNouveauMdp] = useState("");

  const creer = async (event: React.FormEvent) => {
    event.preventDefault();
    setEnvoi(true);
    setErreurs({});
    setMessage(null);

    try {
      const reponse = await fetch("/api/staff-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (reponse.ok) {
        setUsername("");
        setPassword("");
        setRole("MODERATEUR");
        setCreation(false);
        router.refresh();
        return;
      }

      const donnees = await reponse.json().catch(() => null);
      setErreurs(donnees?.erreurs ?? {});
      setMessage(donnees?.message ?? "Creation impossible.");
    } catch {
      setMessage("Le serveur ne repond pas.");
    } finally {
      setEnvoi(false);
    }
  };

  const modifier = async (id: string, corps: Record<string, unknown>) => {
    setEnCours(id);
    setMessage(null);
    try {
      const reponse = await fetch(`/api/staff-users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      if (!reponse.ok) {
        const donnees = await reponse.json().catch(() => null);
        setMessage(donnees?.message ?? "Modification impossible.");
      }
      router.refresh();
    } finally {
      setEnCours(null);
      setAReinitialiser(null);
      setNouveauMdp("");
    }
  };

  const supprimer = async (id: string) => {
    setEnCours(id);
    try {
      const reponse = await fetch(`/api/staff-users/${id}`, { method: "DELETE" });
      if (!reponse.ok) {
        const donnees = await reponse.json().catch(() => null);
        setMessage(donnees?.message ?? "Suppression impossible.");
      }
      router.refresh();
    } finally {
      setEnCours(null);
      setASupprimer(null);
    }
  };

  const bouton =
    "flex h-11 w-11 items-center justify-center border border-line-strong transition-colors disabled:opacity-40";
  const label =
    "mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint";

  return (
    <div>
      {creation ? (
        <form onSubmit={creer} className="panel mb-6 p-6">
          <h2 className="display mb-6 text-2xl">Nouveau compte staff</h2>

          <div className="grid gap-5 lg:grid-cols-3">
            <div>
              <label className={label} htmlFor="nouveau-username">
                Nom d&apos;utilisateur
              </label>
              <input
                id="nouveau-username"
                className="field"
                value={username}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={Boolean(erreurs.username)}
                onChange={(evenement) => setUsername(evenement.target.value)}
              />
              {erreurs.username && (
                <p className="mt-1.5 text-xs text-danger">{erreurs.username}</p>
              )}
            </div>

            <div>
              <label className={label} htmlFor="nouveau-password">
                Mot de passe — 8 caracteres minimum
              </label>
              <input
                id="nouveau-password"
                className="field font-mono text-sm"
                type="text"
                value={password}
                autoComplete="new-password"
                aria-invalid={Boolean(erreurs.password)}
                onChange={(evenement) => setPassword(evenement.target.value)}
              />
              {erreurs.password && (
                <p className="mt-1.5 text-xs text-danger">{erreurs.password}</p>
              )}
            </div>

            <div>
              <label className={label} htmlFor="nouveau-role">
                Role
              </label>
              <select
                id="nouveau-role"
                className="field"
                value={role}
                onChange={(evenement) => setRole(evenement.target.value)}
              >
                {ROLES.map((valeur) => (
                  <option key={valeur} value={valeur}>
                    {roleLabel(valeur)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Le mot de passe est en clair a l'ecran : c'est l'administrateur qui
              le transmet au titulaire, il doit donc pouvoir le relire. */}
          <p className="mt-4 text-xs text-ink-faint">
            Le mot de passe n&apos;est affiche qu&apos;a cet instant. Transmettez-le au
            titulaire, il pourra etre reinitialise mais jamais relu.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
            <button
              type="submit"
              disabled={envoi}
              className="button-primary min-h-12 px-5 text-[0.72rem] disabled:opacity-50"
            >
              <Icon name="check" className="h-4 w-4" /> Creer le compte
            </button>
            <button
              type="button"
              onClick={() => {
                setCreation(false);
                setErreurs({});
                setMessage(null);
              }}
              className="button-secondary min-h-12 px-5 text-[0.72rem]"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreation(true)}
          className="button-primary mb-6 min-h-12 px-5 text-[0.72rem]"
        >
          <Icon name="plus" className="h-4 w-4" /> Nouveau compte staff
        </button>
      )}

      {message && (
        <p
          role="alert"
          className="mb-5 border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {message}
        </p>
      )}

      <ul className="space-y-3">
        {initiaux.map((utilisateur) => {
          const moi = utilisateur.id === moiId;
          const occupe = enCours === utilisateur.id;

          return (
            <li key={utilisateur.id} className="panel p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[14rem] flex-1">
                  <p className="font-semibold">
                    {utilisateur.username}
                    {moi && (
                      <span className="ml-2 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-accent">
                        vous
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    cree le {date(utilisateur.createdAt)}
                    {utilisateur.lastLoginAt
                      ? ` · derniere connexion le ${date(utilisateur.lastLoginAt)}`
                      : " · jamais connecte"}
                  </p>
                </div>

                <span
                  className={`border px-2.5 py-1 text-xs font-bold ${
                    utilisateur.role === "ADMIN"
                      ? "border-accent/40 bg-accent/10 text-accent"
                      : "border-line-strong text-ink-soft"
                  }`}
                >
                  {roleLabel(utilisateur.role)}
                </span>

                <span
                  className={`border px-2.5 py-1 text-xs font-bold ${
                    utilisateur.approved
                      ? "border-ok/40 bg-ok/10 text-ok"
                      : "border-warn/40 bg-warn/10 text-warn"
                  }`}
                >
                  {utilisateur.approved ? "Actif" : "Suspendu"}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={occupe || moi}
                    title={
                      moi
                        ? "Impossible sur votre propre compte"
                        : utilisateur.role === "ADMIN"
                          ? "Retrograder en moderateur"
                          : "Promouvoir administrateur"
                    }
                    onClick={() =>
                      modifier(utilisateur.id, {
                        role: utilisateur.role === "ADMIN" ? "MODERATEUR" : "ADMIN",
                      })
                    }
                    className={`${bouton} text-ink-soft hover:border-accent hover:text-accent`}
                  >
                    <Icon name="shield" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={occupe || moi}
                    title={
                      moi
                        ? "Impossible sur votre propre compte"
                        : utilisateur.approved
                          ? "Suspendre l'acces"
                          : "Reactiver l'acces"
                    }
                    onClick={() =>
                      modifier(utilisateur.id, { approved: !utilisateur.approved })
                    }
                    className={`${bouton} ${
                      utilisateur.approved
                        ? "text-warn hover:border-warn hover:bg-warn/10"
                        : "text-ok hover:border-ok hover:bg-ok/10"
                    }`}
                  >
                    <Icon name={utilisateur.approved ? "clock" : "check"} className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={occupe}
                    title="Reinitialiser le mot de passe"
                    onClick={() => {
                      setAReinitialiser(
                        aReinitialiser === utilisateur.id ? null : utilisateur.id,
                      );
                      setNouveauMdp("");
                    }}
                    className={`${bouton} text-ink-soft hover:border-accent hover:text-accent`}
                  >
                    <Icon name="lock" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={occupe || moi}
                    title={moi ? "Impossible sur votre propre compte" : "Supprimer"}
                    onClick={() => setASupprimer(utilisateur.id)}
                    className={`${bouton} text-danger hover:border-danger hover:bg-danger/10`}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {aReinitialiser === utilisateur.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border border-line-strong bg-void p-4">
                  <label className="sr-only" htmlFor={`mdp-${utilisateur.id}`}>
                    Nouveau mot de passe de {utilisateur.username}
                  </label>
                  <input
                    id={`mdp-${utilisateur.id}`}
                    className="field font-mono text-sm sm:flex-1"
                    placeholder="Nouveau mot de passe — 8 caracteres minimum"
                    value={nouveauMdp}
                    autoComplete="new-password"
                    onChange={(evenement) => setNouveauMdp(evenement.target.value)}
                  />
                  <button
                    type="button"
                    disabled={occupe || nouveauMdp.length < 8}
                    onClick={() => modifier(utilisateur.id, { password: nouveauMdp })}
                    className="button-primary min-h-11 px-4 text-[0.7rem] disabled:opacity-40"
                  >
                    Definir
                  </button>
                  <button
                    type="button"
                    onClick={() => setAReinitialiser(null)}
                    className="min-h-11 border border-line-strong px-4 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {aSupprimer === utilisateur.id && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border border-danger/40 bg-danger/10 p-4">
                  <p className="flex-1 text-sm text-ink">
                    Supprimer definitivement le compte « {utilisateur.username} » ?
                  </p>
                  <button
                    type="button"
                    disabled={occupe}
                    onClick={() => supprimer(utilisateur.id)}
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
    </div>
  );
}
