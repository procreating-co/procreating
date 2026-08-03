"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * `icon` recebe um elemento já renderizado (não o componente) porque este é um Client
 * Component — funções (incluindo componentes de ícone) não podem atravessar a fronteira
 * Server → Client como prop, só elementos já resolvidos.
 */
export function SectionCard({
  href,
  label,
  description,
  icon,
  delay = 0,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className="group h-full border-border/60 bg-card/40 transition-colors hover:border-border">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-foreground/10 text-foreground">
            {icon}
          </div>
          <CardTitle className="pt-4 text-lg font-medium">{label}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="gap-2">
            <Link href={href}>
              Entrar
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
