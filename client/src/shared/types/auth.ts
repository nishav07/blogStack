export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export interface ApiError {
  error: string;
  details?: ValidationDetail[];
}
