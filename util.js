import jwt from "jsonwebtoken";

export function createToken(opts) {
  return jwt.sign(opts, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function verifyClient(req) {
  const clientId = req.headers["x-client-id"];
  console.log(req.headers);
  if (!process.env.CLIENT_IDS.split(",").includes(clientId)) {
    throw new Error(`Client ${clientId} is not authorized.`);
  }
}
