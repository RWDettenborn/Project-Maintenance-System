const express = require("express");
const cors = require("cors");

const equipmentRoutes = require("./routes/equipmentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationRoutes = require("./routes/locationRoutes");
const technicianRoutes = require("./routes/technicianRoutes");
const serviceOrderRoutes = require("./routes/serviceOrderRoutes");
const { authenticateToken } = require("./middlewares/authenticateToken");

const app = express();

// CORS_ORIGIN accepts several addresses separated by comma (see .env.example).
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : "*";

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Maintenance System API is running." });
});

// Every route below needs a valid Firebase token (header "Authorization: Bearer <token>").
// The front-end uses GET /me to know the role of the user (admin or technician).
app.get("/me", authenticateToken, (req, res) => {
    res.json(req.user);
});

app.use("/equipments", authenticateToken, equipmentRoutes);
app.use("/categories", authenticateToken, categoryRoutes);
app.use("/locations", authenticateToken, locationRoutes);
app.use("/technicians", authenticateToken, technicianRoutes);
app.use("/service-orders", authenticateToken, serviceOrderRoutes);

module.exports = app;
