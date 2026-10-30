import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/closet/AppShell";
import { hasSession } from "@/lib/closet-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window !== "undefined" && !hasSession()) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <AppShell />,
});
