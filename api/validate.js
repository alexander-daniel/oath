import jwt from "jsonwebtoken";

export default function (req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).send({
      message: "Authorization header is required.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(400).send({
      message: "Token is required.",
    });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true });
  } catch (err) {
    res.status(401).send({
      message: "Invalid or expired token.",
    });
  }
}
