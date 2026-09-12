import Link from "next/link";
import { Icon } from "./Icon";
import { dateLisible, tempsLecture } from "@/lib/blog";

export type ArticleResume = {
  slug: string;
  titre: string;
  extrait: string;
  couverture: string | null;
  epingle: boolean;
  contenu: string;
  publieLe: string;
};

/// Carte d'article en liste. L'image de couverture passe par une balise <img>
/// et non next/image : les URLs sont saisies par le staff, donc quelconques, et
/// l'optimiseur exigerait de declarer chaque domaine dans next.config.
export function CarteArticle({ article }: { article: ArticleResume }) {
  return (
    <li className="panel group flex flex-col transition-colors hover:border-line-strong">
      <Link href={`/blog/${article.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-surface">
          {article.couverture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.couverture}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgb(255_100_30/0.14),transparent_60%)]">
              <Icon name="news" className="h-10 w-10 text-ink-faint" />
            </div>
          )}

          {article.epingle && (
            <span className="absolute right-0 top-0 flex items-center gap-1.5 bg-accent px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-void">
              <Icon name="pin" className="h-3 w-3" /> Epingle
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
            {dateLisible(article.publieLe)} · {tempsLecture(article.contenu)} min
          </p>
          <h2 className="display mt-3 text-2xl transition-colors group-hover:text-accent">
            {article.titre}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
            {article.extrait}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-accent">
            Lire l&apos;article <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}
