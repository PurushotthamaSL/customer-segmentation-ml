import {
  HealthStatus,
  DatasetSummary,
  ModelMetadata,
  ElbowResponse,
  ScatterDataResponse,
  CustomerListResponse,
  CustomerDetailResponse,
  BusinessInsightsResponse,
  ClusterProfile
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDatasetSummary(): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE}/dataset/summary`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch dataset summary' }));
    throw new Error(err.detail || 'Failed to fetch dataset summary');
  }
  return res.json();
}

export async function uploadDataset(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/dataset/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function resetDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/dataset/reset`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Reset failed' }));
    throw new Error(err.detail || 'Reset failed');
  }
  return res.json();
}

export async function fetchModelStatus(): Promise<ModelMetadata> {
  const res = await fetch(`${API_BASE}/model/status`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch model status' }));
    throw new Error(err.detail || 'Failed to fetch model status');
  }
  return res.json();
}

export async function trainModel(params: {
  features?: string[];
  n_clusters?: number;
  use_scaler?: boolean;
  random_state?: number;
  n_init?: number;
}): Promise<ModelMetadata> {
  const res = await fetch(`${API_BASE}/model/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Training failed' }));
    throw new Error(err.detail || 'Training failed');
  }
  return res.json();
}

export async function fetchElbowData(params?: {
  features?: string[];
  min_k?: number;
  max_k?: number;
  use_scaler?: boolean;
}): Promise<ElbowResponse> {
  const query = new URLSearchParams();
  if (params?.min_k) query.set('min_k', params.min_k.toString());
  if (params?.max_k) query.set('max_k', params.max_k.toString());
  if (params?.use_scaler !== undefined) query.set('use_scaler', params.use_scaler.toString());
  if (params?.features) {
    params.features.forEach(f => query.append('features', f));
  }

  const res = await fetch(`${API_BASE}/model/elbow?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch elbow data' }));
    throw new Error(err.detail || 'Failed to fetch elbow data');
  }
  return res.json();
}

export async function fetchScatterData(xFeature?: string, yFeature?: string): Promise<ScatterDataResponse> {
  const query = new URLSearchParams();
  if (xFeature) query.set('x_feature', xFeature);
  if (yFeature) query.set('y_feature', yFeature);

  const res = await fetch(`${API_BASE}/scatter-data?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch scatter data' }));
    throw new Error(err.detail || 'Failed to fetch scatter data');
  }
  return res.json();
}

export async function fetchSegments(): Promise<ClusterProfile[]> {
  const res = await fetch(`${API_BASE}/segments`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch segments' }));
    throw new Error(err.detail || 'Failed to fetch segments');
  }
  return res.json();
}

export async function updateSegmentLabel(clusterId: number, label: string): Promise<any> {
  const res = await fetch(`${API_BASE}/segments/${clusterId}/label`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update label' }));
    throw new Error(err.detail || 'Failed to update label');
  }
  return res.json();
}

export async function fetchCustomers(params: {
  search?: string;
  cluster?: number;
  gender?: string;
  min_age?: number;
  max_age?: number;
  min_income?: number;
  max_income?: number;
  min_score?: number;
  max_score?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}): Promise<CustomerListResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.cluster !== undefined && params.cluster !== null) query.set('cluster', params.cluster.toString());
  if (params.gender && params.gender !== 'All') query.set('gender', params.gender);
  if (params.min_age !== undefined) query.set('min_age', params.min_age.toString());
  if (params.max_age !== undefined) query.set('max_age', params.max_age.toString());
  if (params.min_income !== undefined) query.set('min_income', params.min_income.toString());
  if (params.max_income !== undefined) query.set('max_income', params.max_income.toString());
  if (params.min_score !== undefined) query.set('min_score', params.min_score.toString());
  if (params.max_score !== undefined) query.set('max_score', params.max_score.toString());
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_dir) query.set('sort_dir', params.sort_dir);
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());

  const res = await fetch(`${API_BASE}/customers?${query.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch customers' }));
    throw new Error(err.detail || 'Failed to fetch customers');
  }
  return res.json();
}

export async function fetchCustomerDetail(customerId: number): Promise<CustomerDetailResponse> {
  const res = await fetch(`${API_BASE}/customers/${customerId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch customer detail' }));
    throw new Error(err.detail || 'Failed to fetch customer detail');
  }
  return res.json();
}

export async function fetchInsights(): Promise<BusinessInsightsResponse> {
  const res = await fetch(`${API_BASE}/insights`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch business insights' }));
    throw new Error(err.detail || 'Failed to fetch business insights');
  }
  return res.json();
}

export function getExportCustomersUrl(cluster?: number): string {
  if (cluster !== undefined && cluster !== null) {
    return `${API_BASE}/customers/export?cluster=${cluster}`;
  }
  return `${API_BASE}/customers/export`;
}
