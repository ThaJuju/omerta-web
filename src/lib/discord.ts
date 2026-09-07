import type { CandidatureInput } from "./validation";
import { posteLabel } from "./postes";
import { questionsPour } from "./questions";
import { AGE_ATTENDU } from "./validation";

/// Un webhook par poste : les candidatures staff et animateur n'atterrissent
/// pas dans le meme salon. `DISCORD_WEBHOOK_URL` sert de repli commun si l'un
/// des deux n'est pas renseigne.
function webhookPour(poste: string): string | undefined {
  const parPoste: Record<string, string | undefined> = {
    STAFF: process.env.DISCORD_WEBHOOK_STAFF,
    ANIMATEUR: process.env.DISCORD_WEBHOOK_ANIMATEUR,
  };

  return parPoste[poste] || process.env.DISCORD_WEBHOOK_URL;
}

/// Teinte de l'embed, pour distinguer les deux flux d'un coup d'oeil.
const COULEURS: Record<string, number> = {
  STAFF: 0x5b9dd9,
  ANIMATEUR: 0xc9a227,
};

/// Notifie le salon concerne. Le webhook reste cote serveur : contrairement a
/// l'ancien site, il n'est jamais expose dans le bundle client.
export async function notifierCandidature(
  candidature: CandidatureInput & { id: string },
): Promise<void> {
  const webhook = webhookPour(candidature.poste);
  if (!webhook) return;

  const champ = (name: string, value: string, inline = false) => ({
    name,
    value: value.length > 1024 ? `${value.slice(0, 1021)}...` : value,
    inline,
  });

  // Les champs de l'embed sont derives des questions du poste : un nouveau
  // poste ou une question modifiee se repercute ici sans intervention.
  const reponses = candidature as unknown as Record<string, unknown>;
  const champsPoste = questionsPour(candidature.poste)
    .filter((question) => question.nom !== "discordTag")
    .map((question) =>
      champ(question.label, String(reponses[question.nom] ?? "—"), question.type !== "textarea"),
    );

  const body = {
    username: `Recrutement ${posteLabel(candidature.poste)} — Omerta FA`,
    embeds: [
      {
        title: `Nouvelle candidature — ${posteLabel(candidature.poste)}`,
        color:
          candidature.age < AGE_ATTENDU
            ? 0xfbbf24
            : (COULEURS[candidature.poste] ?? 0x5b9dd9),
        timestamp: new Date().toISOString(),
        fields: [champ("Discord", candidature.discordTag, true), ...champsPoste].slice(0, 25),
        footer: {
          text:
            candidature.age < AGE_ATTENDU
              ? `Candidature ${candidature.id} · MINEUR (${candidature.age} ans)`
              : `Candidature ${candidature.id}`,
        },
      },
    ],
  };

  try {
    const reponse = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!reponse.ok) {
      // Ne jamais journaliser l'URL : elle contient le jeton du webhook.
      console.error(
        `Webhook Discord (${candidature.poste}) refuse : HTTP ${reponse.status}`,
      );
    }
  } catch (error) {
    // Une candidature enregistree ne doit jamais echouer parce que Discord est down.
    console.error(`Webhook Discord (${candidature.poste}) injoignable:`, error);
  }
}
