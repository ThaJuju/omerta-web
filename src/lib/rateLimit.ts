type Compteur = { total: number; reset: number };

const compteurs = new Map<string, Compteur>();

/// Limiteur en memoire : suffisant pour une instance unique. Passer a Redis
/// si le site est deploye sur plusieurs instances.
export function limiter(cle: string, max: number, fenetreMs: number): boolean {
  const maintenant = Date.now();
  const actuel = compteurs.get(cle);

  if (!actuel || actuel.reset < maintenant) {
    compteurs.set(cle, { total: 1, reset: maintenant + fenetreMs });
    return true;
  }

  if (actuel.total >= max) return false;

  actuel.total += 1;
  return true;
}

// Purge periodique pour que la Map ne grossisse pas indefiniment.
if (typeof setInterval === "function") {
  const timer = setInterval(() => {
    const maintenant = Date.now();
    for (const [cle, valeur] of compteurs) {
      if (valeur.reset < maintenant) compteurs.delete(cle);
    }
  }, 60_000);
  timer.unref?.();
}

export function ipDepuis(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("cf-connecting-ip") || "inconnu";
}
