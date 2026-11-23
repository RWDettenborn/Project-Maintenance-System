const categoryService = require("../services/categoryService");

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function readCategoryData(body) {
    return {
        name: cleanText(body.name),
        description: cleanText(body.description) || null
    };
}

// Returns an error message (shown to the user) or null when the data is valid.
function validateCategoryData(data) {
    if (!data.name) {
        return "Informe o nome da categoria.";
    }
    if (data.name.length > 80) {
        return "O nome deve ter no máximo 80 caracteres.";
    }
    return null;
}

async function getAllCategories(req, res) {
    try {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Erro ao buscar categorias." });
    }
}

async function getCategoryById(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        const category = await categoryService.getCategoryById(id);

        if (!category) {
            return res.status(404).json({ message: "Categoria não encontrada." });
        }

        return res.json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return res.status(500).json({ message: "Erro ao buscar categoria." });
    }
}

async function createCategory(req, res) {
    const data = readCategoryData(req.body);
    const validationError = validateCategoryData(data);

    if (validationError) {
        console.warn("Invalid category data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const category = await categoryService.createCategory(data);
        return res.status(201).json(category);
    } catch (error) {
        if (error.code === "P2002") {
            console.warn("Duplicated category name:", data.name);
            return res.status(409).json({ message: "Já existe uma categoria com este nome." });
        }
        console.error("Error creating category:", error);
        return res.status(500).json({ message: "Erro ao criar categoria." });
    }
}

async function updateCategory(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const data = readCategoryData(req.body);
    const validationError = validateCategoryData(data);

    if (validationError) {
        console.warn("Invalid category data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const category = await categoryService.updateCategory(id, data);
        return res.json(category);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Categoria não encontrada." });
        }
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Já existe uma categoria com este nome." });
        }
        console.error("Error updating category:", error);
        return res.status(500).json({ message: "Erro ao atualizar categoria." });
    }
}

async function deleteCategory(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        await categoryService.deleteCategory(id);
        return res.status(204).end();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Categoria não encontrada." });
        }
        console.error("Error deleting category:", error);
        return res.status(500).json({ message: "Erro ao excluir categoria." });
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
