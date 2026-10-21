export interface HealthStatus {
  status: string;
  service: string;
  dataset_available: boolean;
  default_dataset_path: string;
  is_default_dataset_present: boolean;
  is_active_dataset_present: boolean;
  kaggle_source_url: string;
  version: string;
}

export interface SummaryStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
}

export interface DatasetSummary {
  file_name: string;
  source_type: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  numerical_columns: string[];
  categorical_columns: string[];
  missing_values: Record<string, number>;
  duplicate_rows: number;
  summary_stats: Record<string, SummaryStats>;
  preview: Array<Record<string, any>>;
  is_kaggle_original: boolean;
  source_url: string;
  is_ready: boolean;
  setup_message?: string | null;
}

export interface ClusterProfile {
  cluster_id: number;
  label: string;
  count: number;
  percentage: number;
  feature_means: Record<string, number>;
  feature_medians: Record<string, number>;
  feature_mins: Record<string, number>;
  feature_maxs: Record<string, number>;
  centroid_coordinates: Record<string, number>;
  color: string;
  characteristics: string[];
  marketing_strategy: string;
}

export interface ModelMetadata {
  n_clusters: number;
  features: string[];
  use_scaler: boolean;
  random_state: number;
  n_init: number;
  inertia: number;
  silhouette_score?: number | null;
  clusters: ClusterProfile[];
  global_averages: Record<string, number>;
  trained_at: string;
  total_customers: number;
  custom_labels: Record<number, string>;
}

export interface ElbowPoint {
  k: number;
  inertia: number;
  silhouette_score?: number | null;
}

export interface ElbowResponse {
  points: ElbowPoint[];
  recommended_k: number;
  silhouette_best_k?: number | null;
  explanation: string;
}

export interface ScatterPoint {
  id: number;
  x: number;
  y: number;
  cluster: number;
  label: string;
  color: string;
  gender: string;
  age?: number | null;
}

export interface ScatterCentroid {
  cluster: number;
  label: string;
  x: number;
  y: number;
  color: string;
}

export interface ScatterDataResponse {
  x_feature: string;
  y_feature: string;
  points: ScatterPoint[];
  centroids: ScatterCentroid[];
  total_points: number;
}

export interface CustomerRecord {
  CustomerID: number;
  Gender?: string;
  Age: number;
  "Annual Income (k$)": number;
  "Spending Score (1-100)": number;
  cluster?: number;
  segment_label?: string;
  [key: string]: any;
}

export interface CustomerListResponse {
  items: CustomerRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  columns: string[];
}

export interface CustomerDetailResponse {
  customer: CustomerRecord;
  percentiles: Record<string, number>;
  segment_info?: ClusterProfile | null;
  distance_to_centroid?: number | null;
  key_recommendation?: string | null;
}

export interface Playbook {
  cluster_id: number;
  label: string;
  customer_count: number;
  percentage: number;
  income_avg: number;
  spending_avg: number;
  age_avg: number;
  priority_tier: string;
  urgency: string;
  recommended_channels: string[];
  tactical_actions: string[];
  primary_risk: string;
  color: string;
}

export interface DemographicCohort {
  cohort: string;
  count: number;
  avg_spending: number;
  avg_income: number;
  behavior: string;
}

export interface BusinessInsightsResponse {
  methodology: string;
  ai_transparency_note: string;
  executive_summary: {
    total_customers_analyzed: number;
    identified_segments: number;
    dominant_segment: {
      label: string;
      count: number;
      percentage: number;
    };
    highest_value_segment: {
      label: string;
      avg_income: number;
      avg_spending: number;
    };
  };
  playbooks: Playbook[];
  demographic_insights: DemographicCohort[];
}
