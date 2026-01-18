import axios from 'axios';

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[Axios] Failed to access localStorage.getItem('${key}'):`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[Axios] Failed to access localStorage.setItem('${key}'):`, e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[Axios] Failed to access localStorage.removeItem('${key}'):`, e);
    }
  },
};

// Determine baseURL: Use proxy in browser to avoid CORS, direct URL only for SSR
const getBaseURL = () => {
  // In browser, always use proxy to avoid CORS issues
  if (typeof window !== 'undefined') {
    return '/api';
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 saniye timeout
  withCredentials: true, // CORS with credentials
});

// Staging ortamı için default tenant ID
const STAGING_DEFAULT_TENANT_ID = 'cmi5of04z0000ksb3g5eyu6ts';
// Backend'in beklediği header formatı (küçük harf)
const TENANT_HEADER_NAME = 'x-tenant-id';

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = safeLocalStorage.getItem('accessToken');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ✅ SaaS Multi-Tenant: Add tenant ID header
      // Auth endpoint'lerinde tenant ID ekleme (login ve refresh hariç)
      const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh');

      if (!isAuthEndpoint) {
        // Staging/development ortamı kontrolü
        const hostname = window.location.hostname.toLowerCase();
        const href = window.location.href.toLowerCase();
        const isStagingOrDev =
          hostname.includes('staging') ||
          hostname.includes('localhost') ||
          hostname.includes('127.0.0.1') ||
          href.includes('staging') ||
          process.env.NODE_ENV === 'development';

        // STAGING ORTAMINDA: Tenant ID header'ı EKLEME (backend otomatik handle ediyor)
        if (!isStagingOrDev) {
          // Sadece production ortamında tenant ID header'ı ekle
          const tenantIdToUse = safeLocalStorage.getItem('tenantId');

          if (tenantIdToUse) {
            if (!config.headers) {
              config.headers = {} as any;
            }
            (config.headers as any)[TENANT_HEADER_NAME] = tenantIdToUse;
          }
        }
        // Staging'de tenant ID header'ı göndermiyoruz - backend otomatik handle ediyor
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== 'undefined') {
          const refreshToken = safeLocalStorage.getItem('refreshToken');

          // If no refresh token, redirect to login immediately
          if (!refreshToken) {
            safeLocalStorage.removeItem('accessToken');
            safeLocalStorage.removeItem('refreshToken');

            // Only redirect if we're not already on the login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
              // Return a resolved promise to prevent error from bubbling up
              return Promise.resolve({ data: null });
            }

            return Promise.reject(error);
          }

          // Always use proxy in browser to avoid CORS
          const baseURL = '/api';

          // Use raw axios for refresh to avoid infinite loop
          // Create a new axios instance without interceptors to prevent loop
          const refreshAxios = axios.create({
            baseURL,
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
            withCredentials: true, // CORS with credentials
          });

          // Staging ortamı için default tenant ID ekle (refresh için de gerekli)
          const isStagingOrDev =
            window.location.hostname.includes('staging') ||
            window.location.hostname.includes('localhost') ||
            window.location.hostname.includes('127.0.0.1') ||
            baseURL.includes('staging') ||
            baseURL.includes('localhost') ||
            process.env.NODE_ENV === 'development';

          const refreshHeaders: any = {
            Authorization: `Bearer ${refreshToken}`,
          };

          // STAGING ORTAMINDA: Tenant ID header'ı EKLEME (backend otomatik handle ediyor)
          // Sadece production ortamında tenant ID header'ı ekle
          if (!isStagingOrDev) {
            const tenantId = safeLocalStorage.getItem('tenantId');
            if (tenantId) {
              refreshHeaders[TENANT_HEADER_NAME] = tenantId;
            }
          }
          // Staging'de tenant ID header'ı göndermiyoruz - backend otomatik handle ediyor

          try {
            const response = await refreshAxios.post(
              '/auth/refresh',
              {},
              {
                headers: refreshHeaders,
              }
            );

            const { accessToken } = response.data;
            safeLocalStorage.setItem('accessToken', accessToken);

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Retry the original request
            return axiosInstance(originalRequest);
          } catch (refreshError: any) {
            // Refresh token request failed
            // This could be 401 (invalid refresh token) or 500 (server error)
            throw refreshError;
          }
        }
      } catch (refreshError: any) {
        // Refresh token is invalid, expired, or server error occurred
        if (typeof window !== 'undefined') {
          safeLocalStorage.removeItem('accessToken');
          safeLocalStorage.removeItem('refreshToken');

          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            // Redirect to login without showing error to user
            window.location.href = '/login';
            // Return a resolved promise to prevent error from bubbling up
            return Promise.resolve({ data: null });
          }
        }

        // If we're on login page, reject with the original error
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

