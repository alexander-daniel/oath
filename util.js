export function createToken(opts) {
  return jwt.sign(opts, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}
