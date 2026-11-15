import {
  BarChart3,
  Briefcase,
  Compass,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Scale,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Icons a service can use. The admin area offers these names as choices. */
export const serviceIcons: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  compass: Compass,
  "trending-up": TrendingUp,
  settings: Settings,
  "shield-check": ShieldCheck,
  users: Users,
  globe: Globe,
  "bar-chart": BarChart3,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  landmark: Landmark,
  lightbulb: Lightbulb,
  scale: Scale,
  target: Target,
};

export const serviceIconNames = Object.keys(serviceIcons);

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = serviceIcons[name] ?? Briefcase;
  return <Icon className={className} aria-hidden />;
}
