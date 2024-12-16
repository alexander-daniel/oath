import bcrypt from "bcrypt";
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const existingUser = await redis.hGet("users", username);
  if (existingUser) {
    return res.status(409).send("User already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await redis.hSet("users", username, passwordHash);

  res.status(201).send("User registered successfully.");
}
