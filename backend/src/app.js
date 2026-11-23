const express = require("express");
const cors = require("cors");

const equipmentRoutes = require("./routes/equipmentRoutes");

const app = express();

// app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : "*";

app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Maintenance System API is running." });
});

app.use("/equipments", equipmentRoutes);

module.exports = app;
