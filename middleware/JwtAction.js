const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const nonSecurePath = ["/", "/login", "/logout"];
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
  if (nonSecurePath.includes(req.path)) return next();
  const authorizationHeader = req.headers["authorization"];
  const tokenFromHeader = authorizationHeader.split(" ")[1];
  let cookies = req.cookies;
  if (!cookies || !tokenFromHeader) {
    return res.status(401).json({ message: "You don't have permission" });
  } else {
    let token = cookies && cookies.jwt ? cookies.jwt : tokenFromHeader;
    jwt.verify(token, "1332436432334", (err, data) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Access to the requested resource is prohibited" });
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
