import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — RecargaJá" },
      { name: "description", content: "Confira nossos produtos." },
    ],
  }),
  component: () => (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-extrabold">Produtos</h1>
        <p className="mt-2 text-muted-foreground">Em breve.</p>
      </main>
      <SiteFooter />
    </div>
  ),
});