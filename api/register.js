import bcrypt from "bcrypt";
import Redis from "ioredis";
import { createToken } from "../util.js";

export default async function (req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).send({
      message: "Method Not Allowed",
    });
  }

  const redis = new Redis(process.env.REDIS_URL);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      message: "Username and password are required.",
    });
  }

  const existingUser = await redis.hget("users", username);

  if (existingUser) {
    return res.status(409).send({
      message: "User already exists.",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await redis.hset("users", username, passwordHash);

  const token = createToken({ username });

  res.status(201).send({
    token,
    message: "User registered successfully.",
  });
}
