export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}

export interface DateRangeParams {
  start_date: string;
  end_date: string;
}

export type ExportFormat = 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  date_range: DateRangeParams;
  include_categories?: boolean;
  include_charts?: boolean;
}
