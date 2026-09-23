require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const adminRoutes = require("./routes/adminRoutes");
const positionRoutes = require("./routes/positionRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/
app.use(
  cors({
    origin: [
      "https://voting-front-end.vercel.app",
      "http://localhost:5173",
      "http://192.168.135.42:5173",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/
app.use(express.json());

/*
|--------------------------------------------------------------------------
| Static Files
|--------------------------------------------------------------------------
*/
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/settings", settingsRoutes);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get("/", (req, res) => {
  res.json({
    message: "Voting System API Running",
  });
});

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:");
  console.error(err);

  res.status(500).json({
    message: err.message,
  });
});





/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
``
