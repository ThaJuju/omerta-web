import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Statistiques } from "@/components/Statistiques";
import { Icon, type IconName } from "@/components/Icon";
import { site } from "@/lib/site";
import { postes } from "@/lib/postes";

const piliers: { icon: IconName; titre: string; texte: string }[] = [
  {
    icon: "mask",
    titre: "Roleplay serieux",
    texte:
      "Un personnage, une histoire, des consequences. Le hors-jeu reste dehors et les regles sont appliquees.",
  },
  {
    icon: "scale",
    titre: "Economie coherente",
    texte:
      "Metiers legaux et illegaux equilibres. Ce que vous obtenez, vous l'avez gagne en jeu.",
  },
  {
    icon: "gamepad",
    titre: "Evenements reguliers",
    texte:
      "Braquages, proces, courses, soirees. Le scenario avance meme quand vous ne jouez pas.",
  },
  {
    icon: "shield",
    titre: "Staff present",
    texte:
      "Une equipe joignable, des tickets traites, et des sanctions expliquees plutot que subies.",
  },
];

const etapes = [
  {
    numero: "01",
    titre: "Rejoindre le Discord",
    texte: "Tout passe par la : annonces, tickets, recrutement et vie de la communaute.",
  },
  {
    numero: "02",
    titre: "Lire le reglement",
    texte: "Court, clair et applique. Rien a valider, mais le connaitre evite les mauvaises surprises.",
  },
  {
    numero: "03",
    titre: "Creer son personnage",
    texte: "Un nom, un passe, une raison d'etre en ville. Ca se fait en jeu, en quelques minutes.",
  },
  {
    numero: "04",
    titre: "Se connecter",
    texte: "Acces libre, serveur ouvert en permanence. Un clic sur le lien et FiveM vous emmene en ville.",
  },
];

export default function Accueil() {
  return (
    <>
      <Navbar />
      <main id="contenu">
        <Hero />
        <Statistiques />

        <section id="decouvrir" className="mx-auto w-full max-w-[1340px] px-5 py-24 sm:px-8 sm:py-36">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="kicker">Le serveur</p>
              <h2 className="display mt-6 text-[clamp(3rem,7vw,6rem)]">
                La ville<br /><span className="display-outline">vous observe</span>
              </h2>
              <div className="rule-accent mt-8 max-w-md" />
            </div>
            <div className="lg:col-span-7 lg:pt-12">
              <p className="max-w-2xl text-xl leading-relaxed text-ink-soft sm:text-2xl">
                Omerta FA est un serveur GTA V roleplay francophone. Ici, chaque choix construit une réputation — ou la détruit.
              </p>
              <p className="mt-6 max-w-2xl leading-relaxed text-ink-faint">
                Pas de course à l’argent ni de tir à vue : on y écrit des personnages, des rivalités et des alliances qui durent.
              </p>
            </div>
          </div>

          <ul className="mt-16 grid gap-4 sm:grid-cols-2">
            {piliers.map((pilier, index) => (
              <li key={pilier.titre} className="panel group relative min-h-64 overflow-hidden p-7 sm:p-9">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center border border-line-strong bg-void text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-void">
                    <Icon name={pilier.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs tracking-[0.18em] text-ink-faint">0{index + 1}</span>
                </div>
                <h3 className="display mt-10 text-3xl">{pilier.titre}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-ink-soft">{pilier.texte}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-line bg-bg/85">
          <div className="mx-auto grid w-full max-w-[1340px] gap-14 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="kicker">Accès à la ville</p>
              <h2 className="display mt-6 text-[clamp(3rem,6vw,5rem)]">Votre histoire commence ici</h2>
              <p className="mt-6 leading-relaxed text-ink-soft">
                Le serveur est en <strong className="font-medium text-ink">acces libre</strong> :
                pas de whitelist, pas de dossier a faire valider, pas d&apos;attente.
                Quelques minutes suffisent pour entrer en ville.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a href={site.links.jouer} target="_blank" rel="noopener noreferrer" className="button-primary"><Icon name="gamepad" className="h-4 w-4" />Se connecter au serveur</a>
                <a href={site.links.discord} target="_blank" rel="noopener noreferrer" className="button-secondary"><Icon name="discord" className="h-4 w-4" />Rejoindre Discord</a>
                <a href={site.links.rules} target="_blank" rel="noopener noreferrer" className="button-secondary">Lire le reglement</a>
              </div>
            </div>

            <ol className="lg:col-span-8 lg:border-l lg:border-line lg:pl-12">
              {etapes.map((etape, index) => (
                <li key={etape.numero} className="group grid gap-3 border-t border-line py-7 first:border-t-0 first:pt-0 sm:grid-cols-[5rem_1fr] sm:gap-7">
                  <span className="tabular text-3xl text-accent/70 transition-colors group-hover:text-accent">{etape.numero}</span>
                  <div>
                    <h3 className="display text-2xl">{etape.titre}</h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">{etape.texte}</p>
                  </div>
                  {index < etapes.length - 1 && <span className="hidden" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[url('/assets/wallpaper.jpg')] bg-cover bg-center" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,#070707_0%,rgba(7,7,7,.86)_48%,rgba(7,7,7,.48)_100%)]" />
          <div className="relative mx-auto grid min-h-[560px] w-full max-w-[1340px] items-center gap-10 px-5 py-24 sm:px-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="kicker">Recrutement · Staff & Animateurs</p>
              <h2 className="display mt-6 text-[clamp(3.5rem,8vw,7rem)]">Passez<br /><span className="text-accent">de l’autre côté</span></h2>
            </div>
            <div className="panel p-7 backdrop-blur-md sm:p-9 lg:col-span-5">
              <p className="text-lg leading-relaxed text-ink-soft">Deux equipes recrutent, avec un seul formulaire.</p>
              <dl className="mt-6 space-y-4 border-t border-line pt-6">
                {postes.map((poste) => (
                  <div key={poste.valeur}>
                    <dt className="display text-xl text-ink">{poste.label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink-soft">{poste.resume}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink-faint">Dossier · 10 minutes environ</p>
              <Link href="/candidature" className="button-primary mt-8 w-full"><Icon name="users" className="h-4 w-4" />Déposer ma candidature</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
