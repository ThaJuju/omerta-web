import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FormulaireCandidature } from "@/components/FormulaireCandidature";

export const metadata: Metadata = {
  title: "Recrutement",
  description: "Postulez pour rejoindre l'equipe staff ou l'equipe animation d'Omerta FA.",
  alternates: { canonical: "/candidature" },
};

export default function PageCandidature() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[820px]">
        <FormulaireCandidature />
      </div>
    </PageShell>
  );
}
