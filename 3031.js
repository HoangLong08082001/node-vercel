const express = require("express");
const bodyParser = require("body-parser");
const EmployeeRoutes = require("./API/Employee/EmployeeRoutes.js");
const WebhookRoute = require("./WEBHOOK/WebhookRoute.js");
const CollaboratorRoute = require("./API/Collaborator/CollaboratorRoute.js");
const TeamRoutes = require("./API/Team/TeamRoutes.js");
const ViewRoutes = require("./routes-views/routers.js");
const DepartmentRoutes = require("./API/Department/DepartmentRoutes.js");
const CampaignRoutes = require("./API/Campaign/CampaignRoutes.js");
const RuleRoute = require("./API/Rule/RuleRoutes.js");

const app = express();
const port = 3031;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

CollaboratorRoute(app);

app.listen(port, () => {
  console.log(`Server 1 running on port ${port}`);
});
