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

// Everyone logged in can read. Only administrators can create, edit or delete.

router.get("/", getAllServiceOrders);
router.get("/:id", getServiceOrderById);
router.post("/", requireAdmin, createServiceOrder);
router.put("/:id", requireAdmin, updateServiceOrder);
// Technicians can also change the status of an order (open -> in progress -> completed).
router.patch("/:id/status", changeServiceOrderStatus);
router.delete("/:id", requireAdmin, deleteServiceOrder);

module.exports = router;
