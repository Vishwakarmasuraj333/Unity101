export type FoodPreference = 'Veg Food' | 'Non Veg Food';
export type RegistrationStatus = 'new' | 'confirmed' | 'cancelled';

export interface Registration {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  town: string;
  post_code: string;
  email: string;
  mobile: string;
  food_preference: FoodPreference;
  gdpr_consent: boolean | number;
  status: RegistrationStatus;
  notes?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminSession {
  adminId: number;
  email: string;
  name: string;
  role: string;
}

export interface DashboardMetrics {
  totalRegistrations: number;
  newRegistrations: number;
  confirmedRegistrations: number;
  cancelledRegistrations: number;
  vegFoodCount: number;
  nonVegFoodCount: number;
  trashCount: number;
  todayCount: number;
}

export interface ActivityLog {
  id: number;
  admin_id: number | null;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  description: string;
  created_at: string;
}

export interface DailyActivityItem {
  date: string;
  dayLabel: string;
  count: number;
}

export interface TownDistributionItem {
  town: string;
  count: number;
  percentage: number;
}

export interface CapacityMetrics {
  target: number;
  registered: number;
  percentFilled: number;
  remaining: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

