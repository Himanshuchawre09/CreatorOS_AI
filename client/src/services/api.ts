import { UserRole } from '../config/navigation';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  orgName?: string;
  status: 'active' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  user?: User;
  profile?: any;
  creator?: CreatorProfileData;
  brand?: BrandProfileData;
  portfolio?: PortfolioItemData[];
  pagination?: PaginationMeta;
  message?: string;
  status?: string;
  errors?: unknown;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'creator' | 'brand' | 'freelancer' | 'talentManager';
  orgName?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PlatformItem {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitch' | 'blog' | 'other';
  handle: string;
  url: string;
  followers: number;
  engagementRate?: number;
}

export interface CreatorProfileData {
  _id?: string;
  user?: string;
  displayName: string;
  bio?: string;
  niche: string;
  platforms: PlatformItem[];
  location?: string;
  languages?: string[];
  contentTypes?: string[];
  rateNotes?: string;
  avatarUrl?: string;
  isPublic: boolean;
  totalFollowers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandProfileData {
  _id?: string;
  user?: string;
  companyName: string;
  industry: string;
  website?: string;
  about?: string;
  targetAudience?: string;
  logoUrl?: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FreelancerProfileData {
  _id?: string;
  user?: string;
  headline: string;
  skills: string[];
  bio?: string;
  portfolioLinks?: string[];
  availability: 'available' | 'busy';
  hourlyRate?: number;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TalentManagerProfileData {
  _id?: string;
  user?: string;
  agencyName: string;
  about?: string;
  website?: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioItemData {
  _id?: string;
  owner?: string;
  title: string;
  description?: string;
  type: 'video' | 'image' | 'link' | 'article';
  url: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

export interface DeliverableData {
  type: string;
  count: number;
  details?: string;
}

export type CampaignStatus = 'draft' | 'open' | 'inProgress' | 'completed' | 'cancelled';

export interface CampaignData {
  _id: string;
  brand: {
    _id: string;
    name: string;
    orgName?: string;
  };
  title: string;
  brief: string;
  goals: string[];
  audience: string;
  deliverables: DeliverableData[];
  budget: number;
  currency: string;
  deadline: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  brandProfile?: {
    companyName: string;
    industry: string;
    website?: string;
    about?: string;
    logoUrl?: string;
  } | null;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface CollaborationRequestData {
  _id: string;
  campaign: CampaignData;
  brand: {
    _id: string;
    name: string;
    orgName?: string;
  };
  creator: {
    _id: string;
    name: string;
  };
  sender: {
    _id: string;
    name: string;
    role: string;
    orgName?: string;
  };
  recipient: {
    _id: string;
    name: string;
    role: string;
    orgName?: string;
  };
  pitch?: string;
  proposedRate?: number;
  currency: string;
  status: RequestStatus;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'declined';

export interface ContractData {
  _id: string;
  collaborationRequest:
    | string
    | {
        _id: string;
        pitch?: string;
        proposedRate?: number;
      };
  campaign: {
    _id: string;
    title: string;
    brief: string;
    budget: number;
    currency: string;
    deadline: string;
    status: string;
    deliverables?: DeliverableData[];
  };
  brand: {
    _id: string;
    name: string;
    email?: string;
    orgName?: string;
  };
  creator: {
    _id: string;
    name: string;
    email?: string;
  };
  deliverables: DeliverableData[];
  budget: number;
  currency: string;
  deadline: string;
  notes?: string;
  status: ContractStatus;
  brandSignedAt?: string | null;
  creatorSignedAt?: string | null;
  declinedAt?: string | null;
  declinedBy?: string | null;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';

export interface TaskData {
  _id: string;
  collaborationRequest: string;
  contract?: string;
  title: string;
  description?: string;
  assignee: {
    _id: string;
    name: string;
    email?: string;
    role?: string;
    orgName?: string;
  };
  creator: {
    _id: string;
    name: string;
    role?: string;
  };
  dueDate?: string | null;
  status: TaskStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface HealthData {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime?: number;
  environment?: string;
  version?: string;
  database?: {
    isConnected?: boolean;
    state?: string;
    host?: string;
    name?: string;
  };
  memory?: {
    heapUsedMB?: number;
    heapTotalMB?: number;
    rssMB?: number;
  };
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    credentials: 'include', // Always send and receive cookies with API calls
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const message = responseData?.message || `Request failed with status ${response.status}`;
    const error: Error & { details?: unknown; errors?: unknown; statusCode?: number } = new Error(message);
    error.statusCode = response.status;
    error.errors = responseData?.errors;
    error.details = responseData?.details;
    throw error;
  }

  return responseData as ApiResponse<T>;
}

export const api = {
  getHealth: () => fetchApi<HealthData>('/health'),
  register: (payload: RegisterPayload) =>
    fetchApi<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginPayload) =>
    fetchApi<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    fetchApi<void>('/auth/logout', {
      method: 'POST',
    }),
  getMe: () => fetchApi<{ user: User }>('/auth/me'),

  // Profiles
  getMyProfile: () => fetchApi<any>('/profile/me'),
  updateMyProfile: (data: any) =>
    fetchApi<any>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Discovery
  getCreators: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return fetchApi<CreatorProfileData[]>(`/creators${qs ? `?${qs}` : ''}`);
  },
  getCreatorById: (id: string) => fetchApi<CreatorProfileData>(`/creators/${id}`),

  getBrands: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return fetchApi<BrandProfileData[]>(`/brands${qs ? `?${qs}` : ''}`);
  },
  getBrandById: (id: string) => fetchApi<BrandProfileData>(`/brands/${id}`),

  // Portfolio
  getMyPortfolio: () => fetchApi<PortfolioItemData[]>('/portfolio/me'),
  createPortfolioItem: (data: Partial<PortfolioItemData>) =>
    fetchApi<PortfolioItemData>('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePortfolioItem: (id: string, data: Partial<PortfolioItemData>) =>
    fetchApi<PortfolioItemData>(`/portfolio/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePortfolioItem: (id: string) =>
    fetchApi<void>(`/portfolio/${id}`, {
      method: 'DELETE',
    }),

  // Campaigns
  getCampaigns: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return fetchApi<CampaignData[]>(`/campaigns${qs ? `?${qs}` : ''}`);
  },
  getCampaignById: (id: string) => fetchApi<CampaignData>(`/campaigns/${id}`),
  createCampaign: (data: any) =>
    fetchApi<CampaignData>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCampaign: (id: string, data: any) =>
    fetchApi<CampaignData>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCampaign: (id: string) =>
    fetchApi<void>(`/campaigns/${id}`, {
      method: 'DELETE',
    }),

  // Collaboration Requests
  getRequests: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return fetchApi<CollaborationRequestData[]>(`/requests${qs ? `?${qs}` : ''}`);
  },
  getRequestById: (id: string) => fetchApi<CollaborationRequestData>(`/requests/${id}`),
  createRequest: (data: {
    campaignId: string;
    recipientId: string;
    pitch?: string;
    proposedRate?: number;
    currency?: string;
  }) =>
    fetchApi<CollaborationRequestData>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  respondToRequest: (id: string, action: 'accept' | 'reject') =>
    fetchApi<CollaborationRequestData>(`/requests/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    }),
  withdrawRequest: (id: string) =>
    fetchApi<CollaborationRequestData>(`/requests/${id}/withdraw`, {
      method: 'PUT',
    }),

  // Contracts
  getContracts: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return fetchApi<ContractData[]>(`/contracts${qs ? `?${qs}` : ''}`);
  },
  getContractById: (id: string) => fetchApi<ContractData>(`/contracts/${id}`),
  updateContract: (
    id: string,
    data: {
      deliverables?: DeliverableData[];
      budget?: number;
      currency?: string;
      deadline?: string;
      notes?: string;
    }
  ) =>
    fetchApi<ContractData>(`/contracts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  sendContract: (id: string) =>
    fetchApi<ContractData>(`/contracts/${id}/send`, {
      method: 'PUT',
    }),
  signContract: (id: string) =>
    fetchApi<ContractData>(`/contracts/${id}/sign`, {
      method: 'PUT',
    }),
  declineContract: (id: string, reason?: string) =>
    fetchApi<ContractData>(`/contracts/${id}/decline`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // Tasks / Workspace
  getTasks: (params?: { collaborationId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') {
          query.set(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return fetchApi<TaskData[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },
  createTask: (data: {
    collaborationId: string;
    title: string;
    description?: string;
    assigneeId: string;
    dueDate?: string;
    status?: TaskStatus;
  }) =>
    fetchApi<TaskData>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTask: (
    id: string,
    data: {
      title?: string;
      description?: string;
      assigneeId?: string;
      dueDate?: string | null;
      status?: TaskStatus;
      order?: number;
    }
  ) =>
    fetchApi<TaskData>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTask: (id: string) =>
    fetchApi<void>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
