import React from "react";
import { cn } from "../../lib/utils";

export function Card({ className = "", ...props }) {
  return <div className={cn("rounded-lg border bg-white text-slate-950 shadow-sm", className)} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}
