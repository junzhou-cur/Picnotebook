// Authentication Service API Client
import {
  buildLegacyUrl,
  API_ENDPOINTS,
  getAuthHeaders,
  apiCall,
} from '../config/api';
import {
  User,
  UserProfile,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../types/api';

export class AuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
    }
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const url = buildLegacyUrl(API_ENDPOINTS.auth.login);
    const response = await apiCall<LoginResponse>(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(credentials),
    });

    // Store token after successful login
    this.setToken(response.access_token);
    return response;
  }

  // Register user
  async register(userData: RegisterRequest): Promise<User> {
    const url = buildLegacyUrl(API_ENDPOINTS.auth.register);
    return apiCall<User>(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  }

  // Logout user
  async logout(): Promise<void> {
    if (!this.token) return;

    try {
      const url = buildLegacyUrl(API_ENDPOINTS.auth.logout);
      await apiCall<void>(url, {
        method: 'POST',
        headers: getAuthHeaders(this.token),
      });
    } finally {
      // Always clear token, even if logout request fails
      this.setToken(null);
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<LoginResponse> {
    const url = buildLegacyUrl(API_ENDPOINTS.auth.refresh);
    const response = await apiCall<LoginResponse>(url, {
      method: 'POST',
      headers: getAuthHeaders(this.token),
    });

    this.setToken(response.access_token);
    return response;
  }

  // Check if user is authenticated
  async checkAuth(): Promise<User> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const url = buildLegacyUrl(API_ENDPOINTS.auth.check);
    return apiCall<User>(url, {
      method: 'GET',
      headers: getAuthHeaders(this.token),
    });
  }

  // Get user profile
  async getProfile(): Promise<UserProfile> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const url = buildLegacyUrl(API_ENDPOINTS.auth.profile);
    return apiCall<UserProfile>(url, {
      method: 'GET',
      headers: getAuthHeaders(this.token),
    });
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const url = buildLegacyUrl(API_ENDPOINTS.auth.profile);
    return apiCall<UserProfile>(url, {
      method: 'PUT',
      headers: getAuthHeaders(this.token),
      body: JSON.stringify(updates),
    });
  }

  // MFA Setup
  async setupMFA(): Promise<{ secret: string; qr_code: string }> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const url = buildLegacyUrl(API_ENDPOINTS.auth.mfa.setup);
    return apiCall<{ secret: string; qr_code: string }>(url, {
      method: 'POST',
      headers: getAuthHeaders(this.token),
    });
  }

  // MFA Verify
  async verifyMFA(code: string): Promise<{ verified: boolean }> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const url = buildLegacyUrl(API_ENDPOINTS.auth.mfa.verify);
    return apiCall<{ verified: boolean }>(url, {
      method: 'POST',
      headers: getAuthHeaders(this.token),
      body: JSON.stringify({ code }),
    });
  }

  // MFA Disable
  async disableMFA(password: string): Promise<{ disabled: boolean }> {
    if (!this.token) {
      throw new Error('No authentication token');
    }

    const url = buildLegacyUrl(API_ENDPOINTS.auth.mfa.disable);
    return apiCall<{ disabled: boolean }>(url, {
      method: 'DELETE',
      headers: getAuthHeaders(this.token),
      body: JSON.stringify({ password }),
    });
  }

  // Check if user is authenticated (without API call)
  isAuthenticated(): boolean {
    // Check both token locations
    if (this.token) return true;
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      if (storedToken) {
        this.token = storedToken;
        return true;
      }
    }
    return false;
  }

  // Get authorization header
  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      return {};
    }
    return { Authorization: `Bearer ${this.token}` };
  }
}

// Singleton instance
export const authService = new AuthService();