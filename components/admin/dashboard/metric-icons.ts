import { Download, Eye, Globe, HardDrive, Layers, PenLine, Rocket, UploadCloud, type LucideIcon } from "lucide-react";
import type { DashboardMetricKey } from "@/lib/admin/dashboard/mock-metrics";

export const METRIC_ICONS: Record<DashboardMetricKey, LucideIcon> = {
  activeProjects: Layers,
  publishedProjects: Globe,
  draftProjects: PenLine,
  totalViews: Eye,
  totalDownloads: Download,
  storageUsed: HardDrive,
  lastDeploy: Rocket,
  lastUpload: UploadCloud,
};
