import mysql from "mysql2/promise";

import { RDS_HOSTNAME, RDS_USERNAME, RDS_PASSWORD, RDS_DB_NAME, RDS_PORT } from "../constants.js";

const db = mysql.createPool({
  waitForConnections: true,
  password: RDS_PASSWORD,
  database: RDS_DB_NAME,
  connectionLimit: 10,
  host: RDS_HOSTNAME,
  user: RDS_USERNAME,
  port: RDS_PORT,
  queueLimit: 0,
});

db.getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

process.on("SIGINT", async () => {
  try {
    await db.end();
    console.log("MySQL Database connection closed gracefully");
    process.exit(0);
  } catch (err) {
    console.error("Error closing database connection:", err);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  try {
    await db.end();
    console.log("MySQL Database connection closed gracefully");
    process.exit(0);
  } catch (err) {
    console.error("Error closing database connection:", err);
    process.exit(1);
  }
});

export default db;
