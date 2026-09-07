import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Statut = {
  online: boolean;
  joueurs: number;
  max: number;
  hostname: string | null;
};

const HORS_LIGNE: Statut = { online: false, joueurs: 0, max: 0, hostname: null };

/// Jamais mis en cache par le navigateur, un proxy ou Cloudflare : la reponse
/// change en permanence et une copie figee donne un compteur faux.
const SANS_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
};

/// Proxy vers le serveur FiveM. Cote serveur pour eviter le mixed-content et
/// pour ne pas exposer l'adresse reelle du serveur de jeu dans le navigateur.
export async function GET() {
  const base = (process.env.FIVEM_SERVER_URL || "").replace(/\/+$/, "");
  if (!base) return NextResponse.json(HORS_LIGNE, { headers: SANS_CACHE });

  try {
    const reponse = await fetch(`${base}/dynamic.json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      // Cache tres court : protege le serveur de jeu d'un afflux de requetes
      // sans rendre le compteur visiblement faux.
      next: { revalidate: 5 },
    });

    if (!reponse.ok) return NextResponse.json(HORS_LIGNE, { headers: SANS_CACHE });

    const data = (await reponse.json()) as {
      clients?: number;
      sv_maxclients?: string | number;
      hostname?: string;
    };

    return NextResponse.json({
      online: true,
      joueurs: Number(data.clients ?? 0),
      max: Number(data.sv_maxclients ?? 0),
      hostname: data.hostname ?? null,
    } satisfies Statut, { headers: SANS_CACHE });
  } catch {
    return NextResponse.json(HORS_LIGNE, { headers: SANS_CACHE });
  }
}
