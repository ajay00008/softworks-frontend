/**
 * Token utility functions for authentication
 */

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    
    if (!exp) {
      // No expiration claim, consider it invalid
      return true;
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    return exp < currentTime;
  } catch (error) {
    // If we can't parse the token, consider it expired/invalid
    console.error('Error parsing token:', error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    
    if (!exp) {
      return null;
    }
    
    // Convert seconds to milliseconds
    return exp * 1000;
  } catch (error) {
    console.error('Error parsing token expiration:', error);
    return null;
  }
};

/**
 * Get remaining time until token expires (in milliseconds)
 */
export const getTokenTimeRemaining = (token: string): number => {
  const expirationTime = getTokenExpirationTime(token);
  if (!expirationTime) {
    return 0;
  }
  
  const remaining = expirationTime - Date.now();
  return remaining > 0 ? remaining : 0;
};

/**
 * Validate token and clear if expired
 */
export const validateAndCleanToken = (): boolean => {
  const token = localStorage.getItem('auth-token');
  
  if (!token) {
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.log('[AUTH] ⚠️ Token expired, clearing authentication', {
      timestamp: new Date().toISOString()
    });
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    return false;
  }
  
  return true;
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user');
  
  // Also disconnect socket
  try {
    const { notificationService } = require('@/services/notifications');
    notificationService.disconnect();
  } catch (error) {
    // Ignore if notification service is not available
  }
};

/**
 * Check if user is authenticated with valid token
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth-token');
  return token ? validateAndCleanToken() : false;
};

