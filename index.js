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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Rumaola Server is running!");
});

app.use("/api/ingredients", require("./routes/ingredientRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/meal-plans", require("./routes/mealPlansRoutes"));
app.use("/api/planned-meals", require("./routes/plannedMealRoutes"));
app.use("/api/extra-items", require("./routes/extraItemRoutes"));
app.use("/api", require("./routes/supabaseUpload"));

// TODO: budgeting plan
// MVP Features for Budgeting & Expense Log App
    // User Registration & Login
    // Basic signup/login (email + password)
    // Password reset

    // Dashboard / Overview
    // Show total budget, total expenses, and remaining balance
    // Simple spending summary by category (text or basic chart)

    // Budget Management
    // Create and edit a single budget for a chosen period (e.g., monthly)
    // Set budget limit overall or by a few main categories

    // Expense Logging
    // Add expenses with amount, date, and category
    // Edit and delete expenses

    // Categories
    // Basic predefined categories (e.g., Food, Transport, Entertainment)
    // Assign expense to a category

    // Expense List & History
    // View a list of past expenses sorted by date
    // Search/filter by date or category

    // Basic Notifications
    // Alert when close to exceeding the budget



const SERVER_PORT = process.env.SERVER_PORT || 5005;
const PORT = process.env.PORT || SERVER_PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
