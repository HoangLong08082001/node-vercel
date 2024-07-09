const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const createJwtWebsite = (payload) => {
  let token = null;
  try {
    token = jwt.sign(payload, "apec-global-0827778666", {
      expiresIn: 86400,
    });
  } catch (error) {
    throw error;
  }
  return token;
};
const createJwtApp = (payload) => {
  let token = null;
  try {
    token = jwt.sign(payload, "1332436432334", {
      expiresIn: 86400,
    });
  } catch (error) {
    throw error;
  }
  return token;
};

const authenticationToken = (req, res, next) => {
  const tokenFromHeader = req.headers["authorization"]?.split(" ")[1]; // Lấy token từ header Authorization
  if (!tokenFromHeader) {
    return res.status(401).json({ message: "You don't have permission" });
  } else {
    let token = tokenFromHeader;
    jwt.verify(token, "1332436432334", (err, data) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Access to the requested resource is prohibited" });
      }
      if (data) {
        next();
      }
    });
  }
};
module.exports = {
  authenticationToken,
  createJwtApp,
  createJwtWebsite,
};
