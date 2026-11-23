const express = require("express");
const router = express.Router();

const {
    getAllServiceOrders,
    getServiceOrderById,
    createServiceOrder,
    updateServiceOrder,
    changeServiceOrderStatus,
    deleteServiceOrder
} = require("../controllers/serviceOrderController");
const requireAdmin = require("../middlewares/requireAdmin");

// Só admin altera

router.get("/", getAllServiceOrders);
router.get("/:id", getServiceOrderById);
router.post("/", requireAdmin, createServiceOrder);
router.put("/:id", requireAdmin, updateServiceOrder);
// Técnico altera status
router.patch("/:id/status", changeServiceOrderStatus);
router.delete("/:id", requireAdmin, deleteServiceOrder);

module.exports = router;
