const express = require("express");
import { getAllTeam, createTeam, joinTeam } from "./TeamController.js";
const router = express.Router();
export default function TeamRoutes(app) {
  router.get("/all-team/:id", getAllTeam);
  router.post("/create", createTeam);
  router.post("/join", joinTeam);
  return app.use("/team", router);
}
