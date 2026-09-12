"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/// Connexion uniquement : il n'y a pas d'inscription libre. Les comptes sont
/// crees par un administrateur depuis l'onglet Equipe du dashboard.
export function FormulaireStaff() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEnvoi(true);
    setMessage(null);

    const donnees = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const reponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });
      const data = await reponse.json();

      if (!reponse.ok) {
        setMessage(data.message || "Une erreur est survenue.");
        return;
      }

      router.push("/staff");
      router.refresh();
    } catch {
      setMessage("Connexion au serveur impossible.");
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

      {message && (
        <p
          role="alert"
          className="mt-6 border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {message}
        </p>
      )}

      <form onSubmit={soumettre} className="mt-7 space-y-4">
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

      <p className="mt-6 border-t border-line pt-5 text-xs leading-relaxed text-ink-faint">
        Les comptes staff sont crees par un administrateur. Contactez l&apos;equipe
        sur Discord pour obtenir un acces.
      </p>
    </div>
  );
}
