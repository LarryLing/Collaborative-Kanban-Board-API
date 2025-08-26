import mysql from "mysql2/promise";

import { RDS_DB_NAME, RDS_HOSTNAME, RDS_PASSWORD, RDS_PORT, RDS_USERNAME } from "../constants.js";

const db = mysql.createPool({
  connectionLimit: 10,
  database: RDS_DB_NAME,
  host: RDS_HOSTNAME,
  password: RDS_PASSWORD,
  port: RDS_PORT,
  queueLimit: 0,
  user: RDS_USERNAME,
  waitForConnections: true,
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
