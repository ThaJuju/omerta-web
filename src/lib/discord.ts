import type { CandidatureInput } from "./validation";
import { posteLabel } from "./postes";
import { questionsPour } from "./questions";
import { AGE_ATTENDU } from "./validation";
import { ageDepuis } from "./age";

/// Un webhook par poste : les candidatures staff et animateur n'atterrissent
/// pas dans le meme salon. `DISCORD_WEBHOOK_URL` sert de repli commun si l'un
/// des deux n'est pas renseigne.
/// Un identifiant Discord numerique (17 a 20 chiffres). Rendu en `<@id>`, il
/// devient un lien cliquable vers le profil du candidat. Un pseudo n'en est
/// pas un et reste affiche tel quel.
const ID_DISCORD = /^\d{17,20}$/;

/// Role a notifier a l'arrivee d'une candidature, par poste. Vide ou absent :
/// aucune notification n'est declenchee.
function rolePour(poste: string): string | undefined {
  const parPoste: Record<string, string | undefined> = {
    STAFF: process.env.DISCORD_ROLE_STAFF,
    ANIMATEUR: process.env.DISCORD_ROLE_ANIMATEUR,
  };

  const role = parPoste[poste]?.trim();
  return role && ID_DISCORD.test(role) ? role : undefined;
}

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

  const role = rolePour(candidature.poste);
  const identifiant = candidature.discordTag.trim();
  const mentionnable = ID_DISCORD.test(identifiant);
  const age = ageDepuis(candidature.dateNaissance);
  const mineur = age !== null && age < AGE_ATTENDU;

  const body = {
    username: `Recrutement ${posteLabel(candidature.poste)} — Omerta FA`,

    // Le role, lui, doit notifier : il est mis dans le contenu du message,
    // une mention placee dans un embed ne declenche aucune notification.
    content: role
      ? `<@&${role}> · nouvelle candidature ${posteLabel(candidature.poste)}`
      : undefined,

    // Liste blanche stricte : seul le role configure peut notifier. Le champ
    // Discord du candidat est saisi librement et ne doit jamais pouvoir
    // declencher un @everyone. La mention du candidat reste cliquable dans
    // l'embed et ouvre son profil, sans notifier.
    allowed_mentions: role ? { parse: [], roles: [role] } : { parse: [] },

    embeds: [
      {
        title: `Nouvelle candidature — ${posteLabel(candidature.poste)}`,
        color: mineur ? 0xfbbf24 : (COULEURS[candidature.poste] ?? 0x5b9dd9),
        timestamp: new Date().toISOString(),
        fields: [
          champ(
            "Discord",
            mentionnable ? `<@${identifiant}> \`${identifiant}\`` : identifiant,
            true,
          ),
          champ("Age", age === null ? "—" : `${age} ans`, true),
          ...champsPoste,
        ].slice(0, 25),
        footer: {
          text: mineur
            ? `Candidature ${candidature.id} · MINEUR (${age} ans)`
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
