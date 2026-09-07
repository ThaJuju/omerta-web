"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

export function BoutonDeconnexion() {
  const router = useRouter();

  const deconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/staff/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={deconnecter}
      className="inline-flex min-h-11 items-center gap-2 border border-line-strong px-4 text-sm font-medium text-ink-soft transition-colors hover:border-danger hover:text-danger"
    >
      <Icon name="logout" className="h-4 w-4" />
      Deconnexion
    </button>
  );
}
