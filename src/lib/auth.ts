// Admin Authentication Utilities
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AdminUser;
}

class AuthManager {
  private token: string | null = null;
  private user: AdminUser | null = null;
  private tokenExpiry: number | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('admin_token');
        const userStr = localStorage.getItem('admin_user');
        const expiryStr = localStorage.getItem('admin_token_expiry');
        
        if (userStr) {
          this.user = JSON.parse(userStr);
        }
        
        if (expiryStr) {
          this.tokenExpiry = parseInt(expiryStr);
          // Check if token is expired
          if (this.tokenExpiry && Date.now() > this.tokenExpiry) {
            this.clearAuth();
          } else {
            this.startTokenRefreshTimer();
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        this.clearAuth();
      }
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      
      if (data.success && data.token) {
        // Set token expiry to 30 minutes from now
        const expiry = Date.now() + (30 * 60 * 1000);
        this.setAuth(data.token, data.user, expiry);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if token exists
      if (this.token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  private setAuth(token: string, user: AdminUser, expiry?: number): void {
    this.token = token;
    this.user = user;
    this.tokenExpiry = expiry || null;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      if (expiry) {
        localStorage.setItem('admin_token_expiry', expiry.toString());
      }
    }
    
    // Start token refresh timer
    this.startTokenRefreshTimer();
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    this.tokenExpiry = null;
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token_expiry');
    }
  }

  private startTokenRefreshTimer(): void {
    if (!this.tokenExpiry) return;
    
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    // Set timer to refresh 5 minutes before expiry
    const refreshTime = this.tokenExpiry - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshToken();
      }, refreshTime);
    } else {
      // Token is already close to expiry, refresh immediately
      this.refreshToken();
    }
  }

  private async refreshToken(): Promise<void> {
    if (!this.token) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          const expiry = Date.now() + (30 * 60 * 1000);
          this.setAuth(data.token, this.user!, expiry);
        }
      } else {
        // Refresh failed, logout user
        this.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): AdminUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.token !== null && this.user !== null;
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.user?.role === 'admin';
  }

  isSuperAdmin(): boolean {
    return this.isAuthenticated() && this.user?.role === 'super_admin';
  }

  hasRole(role: 'admin' | 'super_admin'): boolean {
    if (!this.isAuthenticated()) return false;
    return this.user?.role === role;
  }

  // Get headers for authenticated requests
  getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
}

// Create singleton instance
export const authManager = new AuthManager();

// Export for use in components
export const useAuth = () => {
  return {
    login: authManager.login.bind(authManager),
    logout: authManager.logout.bind(authManager),
    isAuthenticated: authManager.isAuthenticated.bind(authManager),
    isAdmin: authManager.isAdmin.bind(authManager),
    isSuperAdmin: authManager.isSuperAdmin.bind(authManager),
    hasRole: authManager.hasRole.bind(authManager),
    getUser: authManager.getUser.bind(authManager),
    getToken: authManager.getToken.bind(authManager),
    getAuthHeaders: authManager.getAuthHeaders.bind(authManager),
  };
};
