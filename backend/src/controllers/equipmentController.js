const equipmentService = require("../services/equipmentService");

const VALID_STATUSES = ["active", "maintenance", "inactive"];

async function getAllEquipments(req, res) {
    try {
        const equipments = await equipmentService.getAllEquipments();
        res.json(equipments);
    } catch (error) {
        console.error("Error fetching equipments:", error);
        res.status(500).json({ message: "Erro ao buscar equipamentos." });
    }
}

async function createEquipment(req, res) {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const patrimony = typeof req.body.patrimony === "string" ? req.body.patrimony.trim() : "";
    const status = req.body.status || "active";

    if (!name) {
        return res.status(400).json({ message: "Informe o nome do equipamento." });
    }
    if (!patrimony) {
        return res.status(400).json({ message: "Informe o patrimônio do equipamento." });
    }
    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Status inválido." });
    }

    try {
        const equipment = await equipmentService.createEquipment({ name, patrimony, status });
        return res.status(201).json(equipment);
    } catch (error) {
        if (error.code === "P2002") {
            console.warn("Duplicated patrimony:", patrimony);
            return res.status(409).json({ message: "Já existe um equipamento com este patrimônio." });
        }
        console.error("Error creating equipment:", error);
        return res.status(500).json({ message: "Erro ao criar equipamento." });
    }
}

async function deleteEquipment(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        await equipmentService.deleteEquipment(id);
        return res.status(204).end();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Equipamento não encontrado." });
        }
        console.error("Error deleting equipment:", error);
        return res.status(500).json({ message: "Erro ao excluir equipamento." });
    }
}

module.exports = {
    getAllEquipments,
    createEquipment,
    deleteEquipment
};
