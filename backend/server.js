const cors = require("cors");
const express = require("express");
const app = express();
const port = 3001;
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

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
app.use(
  "/api/swagger",
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true })
);
app.get("/api/swagger-docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
