"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { navigation, site } from "@/lib/site";

export function Navbar() {
  const pathname = usePathname();
  const [defile, setDefile] = useState(false);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    const surDefilement = () => setDefile(window.scrollY > 24);
    surDefilement();
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  useEffect(() => setOuvert(false), [pathname]);

  const lienClasse = (actif: boolean) =>
    `relative py-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.12em] transition-colors ${
      actif ? "text-accent" : "text-ink-soft hover:text-ink"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className={`mx-auto max-w-[1380px] border transition-all duration-300 ${defile || ouvert ? "border-line-strong bg-void/94 shadow-2xl backdrop-blur-xl" : "border-white/10 bg-void/55 backdrop-blur-md"}`}>
        <div className="flex h-16 items-center gap-7 px-4 sm:px-5">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${site.name}, accueil`}>
            <Image src="/assets/logo.png" alt="" width={42} height={42} className="h-10 w-10 object-contain" priority />
            <div className="leading-none">
              <span className="display block text-xl tracking-[-0.02em]">Omerta</span>
              <span className="mt-1 block font-mono text-[0.55rem] uppercase tracking-[0.28em] text-accent">FA Roleplay</span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex" aria-label="Navigation principale">
            {navigation.map((item) =>
              "external" in item && item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={lienClasse(false)}>{item.label}</a>
              ) : (
                <Link key={item.label} href={item.href} aria-current={pathname === item.href ? "page" : undefined} className={lienClasse(pathname === item.href)}>
                  {item.label}
                  {pathname === item.href && <span className="absolute inset-x-0 -bottom-[1.05rem] h-0.5 bg-accent" />}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link href="/staff/login" className="hidden items-center gap-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-faint transition-colors hover:text-ink sm:flex">
              <Icon name="lock" className="h-3.5 w-3.5" /> Staff
            </Link>
            <Link href="/candidature" className="button-primary hidden min-h-10 px-4 text-[0.7rem] lg:inline-flex">Postuler</Link>
            <button type="button" onClick={() => setOuvert((v) => !v)} aria-expanded={ouvert} aria-controls="menu-mobile" aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"} className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden">
              <Icon name={ouvert ? "cross" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {ouvert && (
          <nav id="menu-mobile" aria-label="Navigation mobile" className="border-t border-line px-4 pb-4 pt-2 lg:hidden">
            {navigation.map((item) =>
              "external" in item && item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 border-b border-line text-sm text-ink-soft"><Icon name={item.icon} className="h-4 w-4 text-accent" />{item.label}</a>
              ) : (
                <Link key={item.label} href={item.href} className={`flex min-h-12 items-center gap-3 border-b border-line text-sm ${pathname === item.href ? "text-accent" : "text-ink-soft"}`}><Icon name={item.icon} className="h-4 w-4 text-accent" />{item.label}</Link>
              ),
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/staff/login" className="button-secondary min-h-11 px-3 text-[0.68rem]"><Icon name="lock" className="h-3.5 w-3.5" /> Staff</Link>
              <Link href="/candidature" className="button-primary min-h-11 px-3 text-[0.68rem]">Postuler</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
