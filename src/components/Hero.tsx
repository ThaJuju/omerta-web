import Link from "next/link";
import { Icon } from "./Icon";
import { ServerStatus } from "./ServerStatus";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative flex min-h-[860px] items-end overflow-hidden lg:min-h-dvh">
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-[1.02] bg-[url('/assets/wallpaper.jpg')] bg-cover bg-[62%_center] lg:bg-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,7,7,.96)_0%,rgba(7,7,7,.74)_42%,rgba(7,7,7,.18)_78%,rgba(7,7,7,.48)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,.36)_0%,transparent_42%,#070707_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-accent/70" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-24 pt-36 sm:px-8 lg:px-12 lg:pb-20">
        <div className="rise grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-ink-soft">
              <span className="text-accent">{site.title}</span>
              <span className="h-px w-10 bg-line-strong" aria-hidden="true" />
              <span>GTA V · Roleplay francophone</span>
              <span className="h-px w-10 bg-line-strong" aria-hidden="true" />
              <span className="text-accent">Acces libre</span>
            </div>

            <h1 className="display mt-9 text-[clamp(5rem,17vw,13rem)] leading-[0.7] text-ink">
              <span className="block">Omerta</span>
              <span className="display-outline ml-[.55em] block text-[.52em] tracking-[0.04em]">FA</span>
            </h1>

            <div className="hero-rule rule-accent mt-10 max-w-2xl" />
          </div>

          <aside className="panel border-l-2 border-l-accent p-5 backdrop-blur-md lg:col-span-3 lg:mb-3">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-ink-faint">Statut de la ville</p>
            <div className="mt-4"><ServerStatus /></div>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">Serveur en acces libre : aucune whitelist, aucune candidature. Connectez-vous et jouez.</p>
          </aside>
        </div>

        <div className="mt-12 grid gap-8 border-t border-line pt-7 lg:grid-cols-12 lg:items-end">
          <p className="max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl lg:col-span-6">
            {site.slogans[0]} Construisez votre personnage, choisissez vos alliances et faites votre place.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-6 lg:justify-end">
            <a href={site.links.jouer} target="_blank" rel="noopener noreferrer" className="button-primary">
              <Icon name="gamepad" className="h-4 w-4" />
              Se connecter au serveur
            </a>
            <a href={site.links.discord} target="_blank" rel="noopener noreferrer" className="button-secondary">
              <Icon name="discord" className="h-4 w-4" />
              Rejoindre le Discord
            </a>
          </div>
        </div>
      </div>

      <a href="#decouvrir" aria-label="Faire defiler vers le contenu" className="absolute bottom-7 right-7 hidden items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint transition-colors hover:text-accent lg:flex">
        Explorer <Icon name="chevronDown" className="h-5 w-5 animate-bounce" />
      </a>
    </section>
  );
}
