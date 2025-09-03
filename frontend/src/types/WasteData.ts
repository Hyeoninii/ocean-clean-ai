export interface WasteData {
  id: number;
  fileName: string;
  latitude: number;
  longitude: number;
  label: string;
  labelKorean: string;
  weight: number;
  cluster: number;
  riskScore: number;
  riskLevel: string;
  locationName: string;
  createdAt: string;
  imagePath: string;
}

export interface WasteDataFilter {
  label?: string;
  riskLevel?: string;
}

export interface WasteDataStatistics {
  averageRiskScore: number;
  maxRiskScore: number;
  labelCounts: Array<[string, number]>;
}

export interface UploadResponse {
  success: boolean;
  filename?: string;
  detectedLabel?: string;
  riskScore?: number;
  confidence?: number;
  data?: WasteData;
  error?: string;
  yoloError?: string;
  yoloAnalysis?: {
    success: boolean;
    detectedLabel: string;
    confidence: number;
    riskScore: number;
    allDetections?: Array<{
      class: string;
      confidence: number;
      class_id: number;
      bbox?: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };
    }>;
    error?: string;
  };
}

export interface HomeData {
  title: string;
  description: string;
  features: string[];
  imagePath: string;
}
