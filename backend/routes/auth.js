import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByGoogleId,
  updateUser,
} from "../db.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const JWT_EXPIRY = "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, google_id, ...rest } = user;
  return rest;
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.sub);
    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password, mobile, emergencyMobile } = req.body || {};

  if (!name || !email || !password || !mobile || !emergencyMobile) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existing = await getUserByEmail(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    mobile: mobile.trim(),
    emergencyMobile: emergencyMobile.trim(),
  });

  const token = signToken(user);
  return res.json({ ok: true, user: sanitizeUser(user), token });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await getUserByEmail(email.toLowerCase().trim());
  if (!user || !user.password_hash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  return res.json({ ok: true, user: sanitizeUser(user), token });
});

// GET /api/auth/me
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Stateless JWT: client should remove token.
  res.json({ ok: true });
});

// Google OAuth flow
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL || "http://localhost:3001"}/api/auth/google/callback`;

  if (!clientId) {
    return res
      .status(501)
      .json({
        error: "Google OAuth not configured (missing GOOGLE_CLIENT_ID)",
      });
  }

  const state = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.BACKEND_URL || "http://localhost:3001"}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return res
      .status(501)
      .json({
        error:
          "Google OAuth not configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET.",
      });
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res
        .status(400)
        .json({ error: "Failed to exchange code for token", info: tokenData });
    }

    const profileRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );
    const profile = await profileRes.json();

    const googleId = profile.sub;
    const email = profile.email;
    const name = profile.name || profile.given_name || "";

    if (!googleId || !email) {
      return res.status(400).json({ error: "Invalid Google profile data" });
    }

    let user =
      (await getUserByGoogleId(googleId)) ||
      (await getUserByEmail(email.toLowerCase().trim()));
    if (!user) {
      user = await createUser({
        name: name || "Google User",
        email: email.toLowerCase().trim(),
        googleId,
      });
    } else if (!user.google_id) {
      user = await updateUser(user.id, { google_id: googleId });
    }

    const token = signToken(user);
    const redirectTo = `${FRONTEND_URL}/login?token=${encodeURIComponent(token)}`;
    return res.redirect(redirectTo);
  } catch (err) {
    console.error("Google OAuth callback error", err);
    return res.status(500).json({ error: "Google OAuth failed" });
  }
});

export default router;
