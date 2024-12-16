import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Redis from "ioredis";

export default async function (req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const redis = new Redis(process.env.REDIS_URL);

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const storedHash = await redis.hget("users", username);
  if (!storedHash) {
    return res.status(401).send("Invalid username or password.");
  }

  const isMatch = await bcrypt.compare(password, storedHash);
  if (!isMatch) {
    return res.status(401).send("Invalid username or password.");
  }

  const token = jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(200).json({ token });
}
