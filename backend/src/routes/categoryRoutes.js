const express = require("express");
const router = express.Router();

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");
const requireAdmin = require("../middlewares/requireAdmin");

// Everyone logged in can read. Only administrators can create, edit or delete.

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", requireAdmin, createCategory);
router.put("/:id", requireAdmin, updateCategory);
router.delete("/:id", requireAdmin, deleteCategory);

module.exports = router;
