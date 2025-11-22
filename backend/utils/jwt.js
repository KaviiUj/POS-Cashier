/**
 * JWT Utility Functions
 * Centralized JWT secret key management
 */

/**
 * Get JWT secret key from environment variables
 * Checks SECRET_KEY first, then JWT_SECRET, then falls back to default
 * @returns {string} JWT secret key
 */
export const getJWTSecret = () => {
  return process.env.SECRET_KEY || process.env.JWT_SECRET || 'your-secret-key';
};

/**
 * Validate that JWT secret is configured (not using default)
 * @returns {boolean} True if secret is configured, false if using default
 */
export const isJWTSecretConfigured = () => {
  const secret = getJWTSecret();
  return secret !== 'your-secret-key' && secret !== undefined && secret !== '';
};

