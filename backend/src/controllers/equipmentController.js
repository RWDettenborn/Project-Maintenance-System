const equipmentService = require("../services/equipmentService");
const storageService = require("../services/storageService");

const VALID_STATUSES = ["active", "maintenance", "inactive"];

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

// Converte a data
function readDate(value) {
    if (!value) {
        return null;
    }
    return new Date(`${value}T00:00:00.000Z`);
}

function readEquipmentData(body) {
    return {
        name: cleanText(body.name),
        patrimony: cleanText(body.patrimony),
        status: body.status || "active",
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        locationId: body.locationId ? Number(body.locationId) : null,
        acquisitionDate: readDate(body.acquisitionDate)
    };
}

// Valida os dados
function validateEquipmentData(data) {
    if (!data.name) {
        return "Informe o nome do equipamento.";
    }
    if (!data.patrimony) {
        return "Informe o patrimônio do equipamento.";
    }
    if (!VALID_STATUSES.includes(data.status)) {
        return "Status inválido.";
    }
    if (data.categoryId !== null && !Number.isInteger(data.categoryId)) {
        return "Categoria inválida.";
    }
    if (data.locationId !== null && !Number.isInteger(data.locationId)) {
        return "Local inválido.";
    }
    if (data.acquisitionDate !== null && Number.isNaN(data.acquisitionDate.getTime())) {
        return "Data de aquisição inválida.";
    }
    return null;
}

async function getAllEquipments(req, res) {
    try {
        const equipments = await equipmentService.getAllEquipments();
        res.json(equipments);
    } catch (error) {
        console.error("Error fetching equipments:", error);
        res.status(500).json({ message: "Erro ao buscar equipamentos." });
    }
}

async function getEquipmentById(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        const equipment = await equipmentService.getEquipmentById(id);

        if (!equipment) {
            return res.status(404).json({ message: "Equipamento não encontrado." });
        }

        return res.json(equipment);
    } catch (error) {
        console.error("Error fetching equipment:", error);
        return res.status(500).json({ message: "Erro ao buscar equipamento." });
    }
}

async function createEquipment(req, res) {
    const data = readEquipmentData(req.body);
    const validationError = validateEquipmentData(data);

    if (validationError) {
        console.warn("Invalid equipment data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const equipment = await equipmentService.createEquipment(data);
        return res.status(201).json(equipment);
    } catch (error) {
        if (error.code === "P2002") {
            console.warn("Duplicated patrimony:", data.patrimony);
            return res.status(409).json({ message: "Já existe um equipamento com este patrimônio." });
        }
        if (error.code === "P2003") {
            return res.status(400).json({ message: "Categoria ou local não encontrado." });
        }
        console.error("Error creating equipment:", error);
        return res.status(500).json({ message: "Erro ao criar equipamento." });
    }
}

async function updateEquipment(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const data = readEquipmentData(req.body);
    const validationError = validateEquipmentData(data);

    if (validationError) {
        console.warn("Invalid equipment data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const equipment = await equipmentService.updateEquipment(id, data);
        return res.json(equipment);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Equipamento não encontrado." });
        }
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Já existe um equipamento com este patrimônio." });
        }
        if (error.code === "P2003") {
            return res.status(400).json({ message: "Categoria ou local não encontrado." });
        }
        console.error("Error updating equipment:", error);
        return res.status(500).json({ message: "Erro ao atualizar equipamento." });
    }
}

async function deleteEquipment(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        const equipment = await equipmentService.getEquipmentById(id);
        await equipmentService.deleteEquipment(id);
        // Remove a foto
        if (equipment) {
            await storageService.deleteEquipmentPhoto(equipment.photoUrl);
        }
        return res.status(204).end();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Equipamento não encontrado." });
        }
        // P2003: possui ordens
        if (error.code === "P2003") {
            return res.status(409).json({ message: "Não é possível excluir: o equipamento possui ordens de serviço." });
        }
        console.error("Error deleting equipment:", error);
        return res.status(500).json({ message: "Erro ao excluir equipamento." });
    }
}

// Recebe a foto
async function uploadEquipmentPhoto(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }
    if (!req.file) {
        return res.status(400).json({ message: "Selecione uma foto." });
    }

    try {
        const equipment = await equipmentService.getEquipmentById(id);
        if (!equipment) {
            return res.status(404).json({ message: "Equipamento não encontrado." });
        }

        const photoUrl = await storageService.uploadEquipmentPhoto(id, req.file);
        const updated = await equipmentService.updateEquipmentPhoto(id, photoUrl);
        await storageService.deleteEquipmentPhoto(equipment.photoUrl);

        return res.json(updated);
    } catch (error) {
        console.error("Error uploading equipment photo:", error);
        return res.status(500).json({ message: "Erro ao enviar a foto do equipamento." });
    }
}

module.exports = {
    getAllEquipments,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    uploadEquipmentPhoto,
    deleteEquipment
};
