const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
require("dotenv").config();
const authMiddleware = require("./middleware/authMiddleware");

const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];

const app = express();
app.use(bodyParser.json()); // Parse incoming JSON data

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(authMiddleware);

app.get("/", (req, res) => {
  res.send("Rumaola Server is running!");
});

const SERVER_PORT = process.env.SERVER_PORT || 5005;
const SERVER_URL = process.env.SERVER_URL || "http://localhost";

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_URL}:${SERVER_PORT}`);
});
