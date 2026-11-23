const express = require("express");
const router = express.Router();

const {
    getAllTechnicians,
    getTechnicianById,
    createTechnician,
    updateTechnician,
    deleteTechnician
} = require("../controllers/technicianController");
const requireAdmin = require("../middlewares/requireAdmin");

// Só admin altera

router.get("/", getAllTechnicians);
router.get("/:id", getTechnicianById);
router.post("/", requireAdmin, createTechnician);
router.put("/:id", requireAdmin, updateTechnician);
router.delete("/:id", requireAdmin, deleteTechnician);

module.exports = router;
