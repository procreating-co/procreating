import { Download, Eye, Globe, HardDrive, Hammer, Layers, Rocket, UploadCloud, type LucideIcon } from "lucide-react";
import type { DashboardMetricKey } from "@/lib/admin/dashboard/mock-metrics";

export const METRIC_ICONS: Record<DashboardMetricKey, LucideIcon> = {
  activeProjects: Layers,
  onlineProjects: Globe,
  developmentProjects: Hammer,
  totalViews: Eye,
  totalDownloads: Download,
  storageUsed: HardDrive,
  lastDeploy: Rocket,
  lastUpload: UploadCloud,
};
