import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/recarga")({
  head: () => ({
    meta: [
      { title: "Recarga — RecargaJá" },
      { name: "description", content: "Recarregue sua carteira." },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-extrabold">Recarga</h1>
        <p className="mt-2 text-muted-foreground">Em breve.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});