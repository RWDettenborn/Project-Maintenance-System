const express = require("express");
const router = express.Router();

const {
    getAllEquipments,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    uploadEquipmentPhoto,
    deleteEquipment
} = require("../controllers/equipmentController");
const requireAdmin = require("../middlewares/requireAdmin");
const uploadPhoto = require("../middlewares/uploadPhoto");

// Só admin altera
router.get("/", getAllEquipments);
router.get("/:id", getEquipmentById);
router.post("/", requireAdmin, createEquipment);
router.put("/:id", requireAdmin, updateEquipment);
router.post("/:id/photo", requireAdmin, uploadPhoto, uploadEquipmentPhoto);
router.delete("/:id", requireAdmin, deleteEquipment);

module.exports = router;
