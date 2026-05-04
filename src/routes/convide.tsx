import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/convide")({
  head: () => ({
    meta: [
      { title: "Convide e ganhe — RecargaJá" },
      { name: "description", content: "Indique amigos e ganhe bônus." },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-extrabold">Convide e ganhe</h1>
        <p className="mt-2 text-muted-foreground">Em breve.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});