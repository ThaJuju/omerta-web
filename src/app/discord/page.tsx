import Image from "next/image";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Icon, type IconName } from "@/components/Icon";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Discord" };

const atouts: { icon: IconName; label: string }[] = [
  { icon: "users", label: "Communaute active" },
  { icon: "chat", label: "Annonces et discussions" },
  { icon: "mic", label: "Salons vocaux" },
  { icon: "gamepad", label: "Evenements roleplay" },
];

export default function PageDiscord() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl py-6">
        <p className="kicker">Communaute</p>
        <h1 className="display mt-4 text-[clamp(2.5rem,8vw,5rem)]">
          Rejoignez
          <br />
          le Discord
        </h1>
        <div className="rule-accent mt-6 max-w-xs" />

        <p className="mt-7 text-lg leading-relaxed text-ink-soft">
          Tout passe par le Discord : annonces, tickets, recrutement, evenements et
          vie de la communaute. C&apos;est le point d&apos;entree du serveur.
        </p>

        <div className="panel mt-12 overflow-hidden border-t-2 border-t-accent">
          <div className="flex items-center gap-4 border-b border-line p-6">
            <Image
              src="/assets/logo.png"
              alt=""
              width={52}
              height={52}
              className="h-13 w-13 object-contain"
            />
            <div>
              <h2 className="display text-2xl">Omerta FA</h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
                Serveur actif
              </p>
            </div>
          </div>

          <ul className="grid gap-px bg-line sm:grid-cols-2">
            {atouts.map((atout) => (
              <li key={atout.label} className="flex items-center gap-3 bg-bg px-5 py-4">
                <Icon name={atout.icon} className="h-4 w-4 shrink-0 text-accent" />
                <span className="text-sm">{atout.label}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-line p-6">
            <a
              href={site.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="button-primary w-full"
            >
              <Icon name="discord" className="h-4 w-4" />
              Rejoindre le serveur Discord
            </a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
