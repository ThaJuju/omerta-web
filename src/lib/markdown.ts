/// Rendu Markdown restreint, sans dependance.
///
/// Le contenu vient du staff, mais un compte staff compromis ne doit pas
/// pouvoir injecter de script sur le site public : tout est echappe **avant**
/// d'etre transforme, et seules les balises generees ici existent. Aucun HTML
/// brut ecrit dans l'editeur n'est interprete.

const ECHAPPEMENTS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const echapper = (valeur: string) =>
  valeur.replace(/[&<>"']/g, (caractere) => ECHAPPEMENTS[caractere]);

/// Seuls http, https, les liens internes et les ancres sont acceptes : cela
/// ferme `javascript:` et `data:`.
function lienSur(url: string): string | null {
  const propre = url.trim();
  if (/^https?:\/\//i.test(propre)) return propre;
  if (/^\/(?!\/)/.test(propre) || propre.startsWith("#")) return propre;
  return null;
}

/// Transformations en ligne, appliquees a du texte deja echappe.
function enLigne(texte: string): string {
  return (
    texte
      // Code inline avant tout le reste : son contenu ne doit rien declencher.
      .replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (entier, alt, url) => {
        const cible = lienSur(url);
        if (!cible) return entier;
        return `<img src="${cible}" alt="${alt}" loading="lazy" />`;
      })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (entier, libelle, url) => {
        const cible = lienSur(url);
        if (!cible) return entier;
        const externe = /^https?:/i.test(cible)
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        return `<a href="${cible}"${externe}>${libelle}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
  );
}

/// Convertit le Markdown restreint en HTML sur. A donner a
/// `dangerouslySetInnerHTML` : le nom effraie, mais rien d'entrant n'y survit
/// sans echappement prealable.
export function rendreMarkdown(source: string): string {
  const lignes = echapper(source.replace(/\r\n/g, "\n")).split("\n");
  const sortie: string[] = [];

  let liste: "ul" | "ol" | null = null;
  let paragraphe: string[] = [];
  let citation: string[] = [];
  let bloc: string[] | null = null;

  const viderParagraphe = () => {
    if (paragraphe.length === 0) return;
    sortie.push(`<p>${enLigne(paragraphe.join(" "))}</p>`);
    paragraphe = [];
  };

  const viderListe = () => {
    if (!liste) return;
    sortie.push(`</${liste}>`);
    liste = null;
  };

  const viderCitation = () => {
    if (citation.length === 0) return;
    sortie.push(`<blockquote><p>${enLigne(citation.join(" "))}</p></blockquote>`);
    citation = [];
  };

  const viderTout = () => {
    viderParagraphe();
    viderListe();
    viderCitation();
  };

  for (const ligne of lignes) {
    // Bloc de code : on recopie tel quel jusqu'a la cloture.
    if (/^\s*```/.test(ligne)) {
      if (bloc) {
        sortie.push(`<pre><code>${bloc.join("\n")}</code></pre>`);
        bloc = null;
      } else {
        viderTout();
        bloc = [];
      }
      continue;
    }
    if (bloc) {
      bloc.push(ligne);
      continue;
    }

    if (ligne.trim() === "") {
      viderTout();
      continue;
    }

    const titre = /^(#{1,4})\s+(.*)$/.exec(ligne);
    if (titre) {
      viderTout();
      const niveau = titre[1].length + 1; // # devient h2 : le h1 est le titre de la page
      sortie.push(`<h${niveau}>${enLigne(titre[2])}</h${niveau}>`);
      continue;
    }

    if (/^\s*(---|\*\*\*)\s*$/.test(ligne)) {
      viderTout();
      sortie.push("<hr />");
      continue;
    }

    const puce = /^\s*[-*]\s+(.*)$/.exec(ligne);
    const numero = /^\s*\d+[.)]\s+(.*)$/.exec(ligne);
    if (puce || numero) {
      viderParagraphe();
      viderCitation();
      const attendue = puce ? "ul" : "ol";
      if (liste !== attendue) {
        viderListe();
        sortie.push(`<${attendue}>`);
        liste = attendue;
      }
      sortie.push(`<li>${enLigne((puce ?? numero)![1])}</li>`);
      continue;
    }

    const citee = /^\s*&gt;\s?(.*)$/.exec(ligne);
    if (citee) {
      viderParagraphe();
      viderListe();
      citation.push(citee[1]);
      continue;
    }

    viderListe();
    viderCitation();
    paragraphe.push(ligne.trim());
  }

  if (bloc) sortie.push(`<pre><code>${bloc.join("\n")}</code></pre>`);
  viderTout();

  return sortie.join("\n");
}

/// Version texte brut, pour les extraits automatiques et les metadonnees.
export function texteBrut(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
