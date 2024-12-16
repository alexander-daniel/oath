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

  const storedHash = await redis.hget("users", username);
  if (!storedHash) {
    return res.status(401).send({
      message: "Invalid username or password.",
    });
  }

  const isMatch = await bcrypt.compare(password, storedHash);
  if (!isMatch) {
    return res.status(401).send({
      message: "Invalid username or password.",
    });
  }

  const token = createToken({ username });

  res.status(200).json({ token });
}
