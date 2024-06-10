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
const createJwtReNew = () => {
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

module.exports = { createJwtApp, createJwtWebsite, createJwtReNew };
