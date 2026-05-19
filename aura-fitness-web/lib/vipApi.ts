import { apiFetch } from "./api";

export interface HeartRateInsights {
  hrMax: number;
  fatBurnZone: { min: number; max: number };
  cardioZone: { min: number; max: number };
  peakZone: { min: number; max: number };
  currentZone?: string;
}

export interface ProgressiveOverloadAnalysis {
  totalVolume: number;
  deltaPercentage?: number;
  trend?: "UP" | "DOWN";
  insight?: string;
}

export interface VIPInsights {
  heartRate: HeartRateInsights;
  readiness: string;
  progressiveOverload: ProgressiveOverloadAnalysis;
}

export const vipApi = {
  getInsights: (currentBpm?: number) => {
    const query = currentBpm ? `?currentBpm=${currentBpm}` : "";
    return apiFetch<VIPInsights>(`/vip/insights${query}`);
  },
  getBodyScanHistory: () => {
    return apiFetch<any[]>("/vip/body-scan/history");
  },
  uploadBodyScan: (formData: FormData) => {
    return apiFetch<any>("/vip/body-scan", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "null"
      }
    });
  },
  getProfile: () => {
    return apiFetch<any>("/profile");
  },
  generateRoadmap: (scanData: any) => {
    return apiFetch<any>("/vip/roadmap", {
      method: "POST",
      body: JSON.stringify(scanData)
    });
  }
};
