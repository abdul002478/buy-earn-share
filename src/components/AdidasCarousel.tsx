import { useEffect, useRef, useState } from "react";
import a1 from "@/assets/adidas-1.jpg";
import a2 from "@/assets/adidas-2.jpg";
import a3 from "@/assets/adidas-3.jpg";
import a4 from "@/assets/adidas-4.jpg";

const SLIDES = [
  { img: a1, titulo: "1949 — Fundação da Adidas", texto: "Adi Dassler funda a Adidas em Herzogenaurach, Alemanha, dando início à lenda das três listras." },
  { img: a2, titulo: "Anos 60 — As três listras", texto: "O símbolo das três listras vira ícone mundial. Adidas calça atletas em todo o planeta." },
  { img: a3, titulo: "1972 — Olimpíadas de Munique", texto: "Adidas patrocina os Jogos Olímpicos e consolida sua presença no esporte de elite." },
  { img: a4, titulo: "Hoje — Marca global", texto: "Adidas é referência mundial em performance, estilo de vida e cultura urbana." },
];

export function AdidasCarousel() {
  const [i, setI] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    ref.current = window.setInterval(() => setI((x) => (x + 1) % SLIDES.length), 4000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, []);
  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-border bg-gradient-card shadow-card">
      <div className="relative aspect-[16/8]">
        {SLIDES.map((s, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0 }}
          >
            <img src={s.img} alt={s.titulo} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-3 sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Propaganda · Adidas</p>
              <h3 className="text-sm font-extrabold sm:text-base">{s.titulo}</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{s.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 py-2">
        {SLIDES.map((_, idx) => (
          <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
        ))}
      </div>
    </div>
  );
}