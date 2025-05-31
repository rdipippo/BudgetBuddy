import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    try {
      console.log('Discovering OIDC config with REPL_ID:', process.env.REPL_ID);
      const config = await client.discovery(
        new URL("https://replit.com/oidc"),
        process.env.REPL_ID!
      );
      console.log('OIDC discovery successful');
      return config;
    } catch (error) {
      console.error('OIDC discovery failed:', error);
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl / 1000, // Convert to seconds
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
    try {
      console.log('OAuth verification successful, processing user...');
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      console.log('User upserted successfully');
      verified(null, user);
    } catch (error) {
      console.error('Error in OAuth verification:', error);
      verified(error, null);
    }
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategyName = `replitauth:${domain}`;
    console.log(`Registering strategy: ${strategyName}`);
    const strategy = new Strategy(
      {
        name: strategyName,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => {
    console.log('Serializing user:', user);
    cb(null, user);
  });
  passport.deserializeUser((user: Express.User, cb) => {
    console.log('Deserializing user:', user);
    cb(null, user);
  });

  app.get("/api/login", (req, res, next) => {
    const strategyName = `replitauth:${req.hostname}`;
    console.log(`Login attempt with strategy: ${strategyName}`);
    console.log(`Available strategies: ${Object.keys((passport as any)._strategies || {}).join(', ')}`);
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const strategyName = `replitauth:${req.hostname}`;
    console.log(`Callback attempt with strategy: ${strategyName}`);
    console.log(`Callback query params:`, req.query);
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
      failureFlash: false
    })(req, res, (err: any) => {
      if (err) {
        console.error('Authentication callback error:', err);
        return res.redirect('/api/login');
      }
      console.log('Authentication callback successful, user:', req.user);
      // Force session save before redirect
      req.session.save(() => {
        res.redirect('/');
      });
    });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as any;
    
    // If no expiration time, allow access
    if (!user.expires_at) {
      return next();
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    // Token expired, try to refresh
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
