import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: "purple" | "gold" | "pink" | "none";
  hover?: boolean;
}

export default function GlassCard({
  children,
  className,
  glow = "none",
  hover = false,
}: GlassCardProps) {
  const glowMap = {
    purple: "hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]",
    gold: "hover:shadow-[0_0_40px_rgba(245,166,35,0.25)]",
    pink: "hover:shadow-[0_0_40px_rgba(236,72,153,0.25)]",
    none: "",
  };

  return (
    <div
      className={cn(
        "glass rounded-2xl",
        hover && "transition-all duration-500 cursor-pointer",
        hover && glowMap[glow],
        className
      )}
    >
      {children}
    </div>
  );
}
