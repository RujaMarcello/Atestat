const cors = require("cors");
const express = require("express");
const app = express();
const port = 3001;
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();

// Import heart rate monitoring functionality
const { monitorHeartRates } = require('./heartRateMonitor');

// Hardcoded token key
process.env.TOKEN_KEY = "medicarenow_jwt_secret_key_12345";

app.use(cors());
app.use(express.json());
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Login API",
      version: "1.0.0",
      description: "Login system APIs",
    },
    servers: [
      {
        url: "http://localhost:3001/api",
      },
    ],
  },
  apis: ["./swagger/swagger.yaml"],
};

const specs = swaggerJsDoc(options);

app.use("/api", require("./api/auth"));
app.use("/api", require("./api/user"));
app.use("/api", require("./api/chat"));
app.use("/api", require("./api/patients"));
app.use(
  "/api/swagger",
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true })
);
app.get("/api/swagger-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

// Heart rate monitoring API endpoint - trigger manual check
app.get("/api/monitor-heart-rates", async (req, res) => {
  try {
    await monitorHeartRates();
    res.status(200).json({ message: "Heart rate monitoring check completed successfully" });
  } catch (error) {
    console.error("Error during heart rate monitoring:", error);
    res.status(500).json({ error: "Failed to run heart rate monitoring" });
  }
});

// Set up a schedule to monitor heart rates every 5 minutes
const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
setInterval(async () => {
  try {
    console.log("Running scheduled heart rate monitoring...");
    await monitorHeartRates();
  } catch (error) {
    console.error("Error during scheduled heart rate monitoring:", error);
  }
}, MONITORING_INTERVAL);

// Run an initial check when the server starts
setTimeout(async () => {
  try {
    console.log("Running initial heart rate monitoring check...");
    await monitorHeartRates();
  } catch (error) {
    console.error("Error during initial heart rate monitoring:", error);
  }
}, 10000); // Wait 10 seconds after server start

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
