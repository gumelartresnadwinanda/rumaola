const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const path = require("path");
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

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("Rumaola Server is running!");
});

app.use("/api/ingredients", require("./routes/ingredientRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/meal-plans", require("./routes/mealPlansRoutes"));
app.use("/api/planned-meals", require("./routes/plannedMealRoutes"));
app.use("/api/extra-items", require("./routes/extraItemRoutes"));
app.use("/api", require("./routes/upload")); // Add the upload route

const SERVER_PORT = process.env.SERVER_PORT || 5005;
const SERVER_URL = process.env.SERVER_URL || "http://localhost";

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_URL}:${SERVER_PORT}`);
});
