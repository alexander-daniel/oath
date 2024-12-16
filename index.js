import { serve } from "bun";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createClient } from "redis";

// Environment variables
const REDIS_URL = process.env.REDIS_URL;
const JWT_SECRET = process.env.JWT_SECRET;

if (!REDIS_URL || !JWT_SECRET) {
  console.error("Missing REDIS_URL or JWT_SECRET environment variables.");
  process.exit(1);
}

// Redis connection
const redis = createClient({ url: REDIS_URL });
await redis.connect();

// Helper functions
async function setUser(username, passwordHash) {
  await redis.hSet("users", username, passwordHash);
}

async function getUser(username) {
  return await redis.hGet("users", username);
}

function generateToken(username) {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Route Handlers
async function register(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return new Response("Username and password are required.", { status: 400 });
  }

  const existingUser = await getUser(username);
  if (existingUser) {
    return new Response("User already exists.", { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await setUser(username, passwordHash);

  return new Response("User registered successfully.", { status: 201 });
}

async function login(req) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return new Response("Username and password are required.", { status: 400 });
  }

  const storedHash = await getUser(username);
  if (!storedHash) {
    return new Response("Invalid username or password.", { status: 401 });
  }

  const isMatch = await bcrypt.compare(password, storedHash);
  if (!isMatch) {
    return new Response("Invalid username or password.", { status: 401 });
  }

  const token = generateToken(username);
  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function validate(req) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return new Response("Token is required.", { status: 400 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return new Response("Invalid or expired token.", { status: 401 });
  }

  return new Response(JSON.stringify({ valid: true, payload }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Start Bun server
serve({
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/register" && req.method === "POST") {
      return register(req);
    }

    if (url.pathname === "/login" && req.method === "POST") {
      return login(req);
    }

    if (url.pathname === "/validate" && req.method === "GET") {
      return validate(req);
    }

    return new Response("Not Found", { status: 404 });
  },
});
