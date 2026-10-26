import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/closet/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    if (!localStorage.getItem("drape:session")) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <AppShell />
  ),
});
