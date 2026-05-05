import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/recarga")({
  component: () => {
    const navigate = useNavigate();
    useEffect(() => {
      navigate({ to: "/carteira" });
    }, [navigate]);
    return null;
  },
});