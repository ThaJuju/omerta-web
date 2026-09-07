import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Icon } from "@/components/Icon";

export default function Introuvable() {
  return (
    <PageShell center>
      <div className="text-center">
        <p className="display text-[clamp(5rem,20vw,12rem)] leading-none text-accent">404</p>
        <div className="rule-accent mx-auto mt-4 max-w-xs" />
        <h1 className="display mt-8 text-3xl">Cette page n&apos;existe pas</h1>
        <p className="mt-3 text-ink-soft">
          Le lien est peut-etre obsolete ou mal recopie.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex min-h-13 items-center gap-2.5 border border-line-strong px-7 text-sm font-semibold uppercase tracking-[0.14em] transition-colors hover:border-accent hover:text-accent"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          Retour a l&apos;accueil
        </Link>
      </div>
    </PageShell>
  );
}
