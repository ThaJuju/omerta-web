import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/// Enveloppe des pages internes : navbar fixe, contenu, pied de page.
export function PageShell({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <>
      <Navbar />
      <main
        id="contenu"
        className={`mx-auto w-full max-w-[1340px] px-5 pb-24 pt-32 sm:px-8 sm:pt-36 ${
          center ? "flex min-h-[70dvh] items-center justify-center" : ""
        }`}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
