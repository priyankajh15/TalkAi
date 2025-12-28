const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "TalkAi backend" });
});

module.exports = app;
