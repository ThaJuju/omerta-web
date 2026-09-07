import type { CandidatureInput } from "./validation";
import { posteLabel } from "./postes";

/// Notifie le salon staff. Le webhook reste cote serveur : contrairement a
/// l'ancien site, il n'est jamais expose dans le bundle client.
export async function notifierCandidature(
  candidature: CandidatureInput & { id: string },
): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return;

  const champ = (name: string, value: string, inline = false) => ({
    name,
    value: value.length > 1024 ? `${value.slice(0, 1021)}...` : value,
    inline,
  });

  const body = {
    username: "Recrutement Omerta FA",
    embeds: [
      {
        title: `Nouvelle candidature — ${posteLabel(candidature.poste)}`,
        color: 0xff8f6b,
        timestamp: new Date().toISOString(),
        fields: [
          champ("Poste", posteLabel(candidature.poste), true),
          champ("Discord", candidature.discordTag, true),
          champ("Prenom", candidature.prenom, true),
          champ("Age", String(candidature.age), true),
          champ("Heures FiveM", candidature.heuresFiveM, true),
          champ("Anciennete", candidature.ancienneteOmerta, true),
          champ("Experience staff", candidature.experienceStaff, true),
          champ("Disponibilite", candidature.disponibilite),
          champ("Motivation", candidature.motivation),
          champ("Pourquoi lui / elle", candidature.pourquoiToi),
        ],
        footer: { text: `Candidature ${candidature.id}` },
      },
    ],
  };

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    // Une candidature enregistree ne doit jamais echouer parce que Discord est down.
    console.error("Webhook Discord injoignable:", error);
  }
}
