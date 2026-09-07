"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

type Onglet = "connexion" | "inscription";

export function FormulaireStaff() {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>("connexion");
  const [message, setMessage] = useState<{ texte: string; type: "erreur" | "ok" } | null>(
    null,
  );
  const [envoi, setEnvoi] = useState(false);

  const changerOnglet = (suivant: Onglet) => {
    setOnglet(suivant);
    setMessage(null);
  };

  const soumettre = async (event: React.FormEvent<HTMLFormElement>, chemin: string) => {
    event.preventDefault();
    setEnvoi(true);
    setMessage(null);

    const donnees = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const reponse = await fetch(`/api/auth/${chemin}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      const data = await reponse.json();

      if (!reponse.ok) {
        setMessage({ texte: data.message || "Une erreur est survenue.", type: "erreur" });
        return;
      }

      if (chemin === "login") {
        router.push("/staff");
        router.refresh();
        return;
      }

      setMessage({ texte: data.message, type: "ok" });
      event.currentTarget.reset();
    } catch {
      setMessage({ texte: "Connexion au serveur impossible.", type: "erreur" });
    } finally {
      setEnvoi(false);
    }
  };

  const champ = (
    id: string,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string,
  ) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id.split("-").pop()}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={false}
        className="field"
      />
    </div>
  );

  return (
    <div className="panel w-full max-w-[460px] border-t-2 border-t-accent p-8 sm:p-10">
      <div>
        <p className="kicker">Acces reserve</p>
        <h1 className="display mt-3 text-4xl">Espace Staff</h1>
        <div className="rule-accent mt-5" />
      </div>

      <div className="mt-8 flex border border-line">
        {(["connexion", "inscription"] as const).map((valeur) => (
          <button
            key={valeur}
            type="button"
            onClick={() => changerOnglet(valeur)}
            className={`min-h-11 flex-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              onglet === valeur ? "bg-accent text-void" : "text-ink-soft hover:text-ink"
            }`}
          >
            {valeur}
          </button>
        ))}
      </div>

      {message && (
        <p
          role="alert"
          className={`mt-5  border px-4 py-3 text-sm ${
            message.type === "erreur"
              ? "border-danger/40 bg-danger/10 text-danger"
              : "border-ok/40 bg-ok/10 text-ok"
          }`}
        >
          {message.texte}
        </p>
      )}

      {onglet === "connexion" ? (
        <form onSubmit={(event) => soumettre(event, "login")} className="mt-6 space-y-4">
          {champ("login-username", "Nom d'utilisateur", "text", "Votre identifiant", "username")}
          {champ("login-password", "Mot de passe", "password", "Votre mot de passe", "current-password")}
          <button
            type="submit"
            disabled={envoi}
            className="button-primary w-full disabled:opacity-50"
          >
            {envoi ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      ) : (
        <form onSubmit={(event) => soumettre(event, "register")} className="mt-6 space-y-4">
          {champ("register-username", "Nom d'utilisateur", "text", "Choisissez un identifiant", "username")}
          {champ("register-password", "Mot de passe", "password", "8 caracteres minimum", "new-password")}
          {champ("register-confirm", "Confirmer le mot de passe", "password", "Retapez le mot de passe", "new-password")}
          <p className="text-xs text-ink-soft">
            Le compte devra etre approuve par un administrateur avant la premiere
            connexion.
          </p>
          <button
            type="submit"
            disabled={envoi}
            className="button-primary w-full disabled:opacity-50"
          >
            {envoi ? "Creation..." : "Creer le compte"}
          </button>
        </form>
      )}
    </div>
  );
}
