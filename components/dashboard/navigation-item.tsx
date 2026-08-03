import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavigationItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}
