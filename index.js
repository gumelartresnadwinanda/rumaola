const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const path = require("path");
require("dotenv").config();

const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];

const app = express();
app.use(bodyParser.json());

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

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Rumaola Server is running!");
});
 
app.use("/api/ingredients", require("./routes/ingredientRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/meal-plans", require("./routes/mealPlansRoutes"));
app.use("/api/planned-meals", require("./routes/plannedMealRoutes"));
app.use("/api/extra-items", require("./routes/extraItemRoutes"));

if (process.env.SUPABASE_URL) {
  app.use("/api", require("./routes/supabaseUpload"));
} else {
  app.use("/api", require("./routes/upload"));
}

app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/sources", require("./routes/sourceRoutes"));

const SERVER_PORT = process.env.SERVER_PORT || 5005;
const PORT = process.env.PORT || SERVER_PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
