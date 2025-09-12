import { Request, Response, NextFunction } from 'express';

// Admin email allowlist - get from environment variables for security
const getAdminEmails = (): string[] => {
  const envEmails = process.env.ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(',').map(email => email.trim().toLowerCase());
  }
  
  // Fallback for development - should be configured via environment in production
  return [
    'admin@tripwise.com',
    'support@tripwise.com',
  ];
};

export interface AdminAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

/**
 * Middleware to check if user has admin privileges
 * Verifies user authentication via session and checks against admin email allowlist
 */
export function requireAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  // Check if user is authenticated via session
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'User must be logged in to access admin features'
    });
  }

  const user = req.session.user;
  const userEmail = user.email;
  
  if (!userEmail) {
    return res.status(401).json({
      error: 'email_required',
      message: 'User email is required for admin access'
    });
  }
  
  // Check if user email is in admin allowlist
  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(userEmail.toLowerCase())) {
    console.warn(`Unauthorized admin access attempt by user: ${userEmail}`);
    return res.status(403).json({
      error: 'admin_access_required', 
      message: 'Admin privileges required. Contact support if you need admin access.'
    });
  }

  // Add admin flag to request for downstream handlers
  req.user = {
    id: user.id,
    email: userEmail,
    isAdmin: true
  };

  console.log(`Admin access granted to user: ${userEmail}`);
  next();
}

/**
 * Check if user has admin privileges (without middleware)
 * Returns boolean for programmatic checks
 */
export function isAdmin(userEmail?: string): boolean {
  if (!userEmail) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(userEmail.toLowerCase());
}

/**
 * Get admin configuration
 */
export function getAdminConfig() {
  return {
    allowedEmails: getAdminEmails(),
    requiresEmailVerification: true,
    sessionRequired: true,
    authMethod: 'session_based'
  };
}

/**
 * Development helper to simulate admin session (for testing only)
 * This should NEVER be used in production
 */
export function createDevAdminSession(req: any, adminEmail?: string) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development admin session not allowed in production');
  }
  
  const email = adminEmail || 'admin@tripwise.com';
  req.session = {
    user: {
      id: email.split('@')[0],
      email: email,
      name: 'Admin User'
    }
  };
  
  console.log(`Created development admin session for: ${email}`);
}