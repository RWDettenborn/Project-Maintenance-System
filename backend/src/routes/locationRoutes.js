const express = require("express");
const router = express.Router();

const {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
} = require("../controllers/locationController");
const requireAdmin = require("../middlewares/requireAdmin");

// Só admin altera

router.get("/", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", requireAdmin, createLocation);
router.put("/:id", requireAdmin, updateLocation);
router.delete("/:id", requireAdmin, deleteLocation);

module.exports = router;
