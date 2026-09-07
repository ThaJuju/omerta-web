import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { FormulaireStaff } from "@/components/FormulaireStaff";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Connexion Staff", robots: { index: false } };

export default async function PageConnexion() {
  if (await getSession()) redirect("/staff");

  return (
    <PageShell center>
      <FormulaireStaff />
    </PageShell>
  );
}
