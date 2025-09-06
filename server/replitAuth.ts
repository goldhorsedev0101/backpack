import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage.js";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use in-memory store temporarily until database is ready
  return session({
    secret: process.env.SESSION_SECRET || 'demo-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      path: '/',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const domains = process.env.REPLIT_DOMAINS!.split(",");
  
  // Add localhost support for development
  if (process.env.NODE_ENV !== 'production') {
    domains.push('localhost:5000');
  }
  
  for (const domain of domains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `${domain.includes('localhost') ? 'http' : 'https'}://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", async (req, res, next) => {
    // For localhost development, create a test user session
    if (req.hostname === 'localhost') {
      try {
        // Create a test user for development
        const testUserData = {
          id: 'test-user-123',
          email: 'test@tripwise.dev',
          firstName: 'Test',
          lastName: 'User'
        };
        
        // Ensure the test user exists in the database
        await upsertUser(testUserData);
        
        req.login(testUserData, (err) => {
          if (err) {
            return next(err);
          }
          return res.redirect('/');
        });
        return;
      } catch (error) {
        console.error('Error creating test user:', error);
        return next(error);
      }
    }
    
    // For production/Replit domain, use proper authentication
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Check if this is a Supabase OAuth callback
    const hasSupabaseParams = req.query.code && 
      (req.query.state || req.originalUrl.includes('supabase'));
    
    if (hasSupabaseParams) {
      console.log('Supabase OAuth detected, redirecting to client callback');
      // Redirect to client-side callback with all query parameters
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      return res.redirect(`/auth/callback?${queryString}`);
    }
    
    // Otherwise, handle as Replit Auth callback
    // Map localhost to localhost:5000 for development
    const hostname = req.hostname === 'localhost' ? 'localhost:5000' : req.hostname;
    
    passport.authenticate(`replitauth:${hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      console.log('Logout request - hostname:', req.hostname, 'NODE_ENV:', process.env.NODE_ENV);
      
      // Destroy the session completely
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
          }
        });
      }
      
      // Clear all cookies
      res.clearCookie('connect.sid', { path: '/' });
      res.clearCookie('session', { path: '/' });
      
      // For localhost development, redirect to home with cache busting
      if (req.hostname === 'localhost' || process.env.NODE_ENV === 'development') {
        console.log('Complete logout for development');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        return res.redirect('/?logout=true&t=' + Date.now());
      }
      
      console.log('Using OIDC logout for production');
      // For production, use proper OIDC logout
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}/?logout=true`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
