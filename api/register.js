import bcrypt from "bcrypt";
import Redis from "ioredis";
import { createToken } from "../util.js";

export default async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // allow post and options
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // for options and cors -> do your thing
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  console.log("req", req.body);
  const redis = new Redis(process.env.REDIS_URL);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const existingUser = await redis.hget("users", username);

  if (existingUser) {
    return res.status(409).send("User already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await redis.hset("users", username, passwordHash);

  const token = createToken({ username });

  res.status(201).send({
    token,
    message: "User registered successfully.",
  });
}
