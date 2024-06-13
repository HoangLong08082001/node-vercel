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
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "You don't have permission" });
  } else {
    jwt.verify(token, "1332436432334", (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        return res
          .status(200)
          .json({ message: "success", data, access_token: token });
      }
    });
  }
};
module.exports = {
  authenticationToken,
  createJwtApp,
  createJwtWebsite,
};
