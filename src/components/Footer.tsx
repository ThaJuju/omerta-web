import Link from "next/link";
import Image from "next/image";
import { navigation, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="mx-auto w-full max-w-[1340px] px-5 py-14 sm:px-8 sm:py-18">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-4">
              <Image src="/assets/logo.png" alt="" width={52} height={52} className="h-13 w-13 object-contain" />
              <div><span className="display block text-3xl">Omerta FA</span><span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-accent">Roleplay francophone</span></div>
            </div>
            <p className="mt-6 max-w-md leading-relaxed text-ink-faint">Une ville, des règles, et ce que vous en faites. Votre histoire commence quand les portes s’ouvrent.</p>
          </div>

          <nav aria-label="Liens de pied de page" className="lg:col-span-6">
            <p className="kicker">Navigation</p>
            <ul className="mt-5 grid gap-px bg-line sm:grid-cols-2">
              {navigation.map((item) => (
                <li key={item.label} className="bg-void">
                  {"external" in item && item.external ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between px-4 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-accent"><span>{item.label}</span><span aria-hidden="true">↗</span></a>
                  ) : (
                    <Link href={item.href} className="flex min-h-12 items-center justify-between px-4 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-accent"><span>{item.label}</span><span aria-hidden="true">→</span></Link>
                  )}
                </li>
              ))}
              <li className="bg-void"><Link href="/staff/login" className="flex min-h-12 items-center justify-between px-4 text-sm text-ink-faint transition-colors hover:bg-surface hover:text-accent"><span>Connexion Staff</span><span aria-hidden="true">→</span></Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p>Non affilié à Rockstar Games ni à Take-Two Interactive.</p>
        </div>
      </div>
    </footer>
  );
}
