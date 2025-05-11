require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "login_data_base",
  password: process.env.REACT_DATABASE_PASSWORD + "",
  port: 5432,
});

module.exports = pool;