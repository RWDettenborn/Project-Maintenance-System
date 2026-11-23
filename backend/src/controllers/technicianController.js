const technicianService = require("../services/technicianService");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function readTechnicianData(body) {
    return {
        name: cleanText(body.name),
        phone: cleanText(body.phone),
        email: cleanText(body.email).toLowerCase(),
        specialty: cleanText(body.specialty)
    };
}

// Returns an error message (shown to the user) or null when the data is valid.
function validateTechnicianData(data) {
    if (!data.name) {
        return "Informe o nome do técnico.";
    }
    if (data.phone.replace(/\D/g, "").length < 10) {
        return "Informe um telefone válido com DDD.";
    }
    if (!EMAIL_PATTERN.test(data.email)) {
        return "Informe um e-mail válido.";
    }
    if (!data.specialty) {
        return "Informe a especialidade.";
    }
    return null;
}

async function getAllTechnicians(req, res) {
    try {
        const technicians = await technicianService.getAllTechnicians();
        res.json(technicians);
    } catch (error) {
        console.error("Error fetching technicians:", error);
        res.status(500).json({ message: "Erro ao buscar técnicos." });
    }
}

async function getTechnicianById(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        const technician = await technicianService.getTechnicianById(id);

        if (!technician) {
            return res.status(404).json({ message: "Técnico não encontrado." });
        }

        return res.json(technician);
    } catch (error) {
        console.error("Error fetching technician:", error);
        return res.status(500).json({ message: "Erro ao buscar técnico." });
    }
}

async function createTechnician(req, res) {
    const data = readTechnicianData(req.body);
    const validationError = validateTechnicianData(data);

    if (validationError) {
        console.warn("Invalid technician data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const technician = await technicianService.createTechnician(data);
        return res.status(201).json(technician);
    } catch (error) {
        // P2002: Prisma code for "unique constraint failed" (e-mail already used)
        if (error.code === "P2002") {
            console.warn("Duplicated technician e-mail:", data.email);
            return res.status(409).json({ message: "Já existe um técnico com este e-mail." });
        }
        console.error("Error creating technician:", error);
        return res.status(500).json({ message: "Erro ao criar técnico." });
    }
}

async function updateTechnician(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const data = readTechnicianData(req.body);
    const validationError = validateTechnicianData(data);

    if (validationError) {
        console.warn("Invalid technician data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const technician = await technicianService.updateTechnician(id, data);
        return res.json(technician);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Técnico não encontrado." });
        }
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Já existe um técnico com este e-mail." });
        }
        console.error("Error updating technician:", error);
        return res.status(500).json({ message: "Erro ao atualizar técnico." });
    }
}

async function deleteTechnician(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        await technicianService.deleteTechnician(id);
        return res.status(204).end();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Técnico não encontrado." });
        }
        // P2003: Prisma code for "foreign key constraint failed" (technician has service orders)
        if (error.code === "P2003") {
            return res.status(409).json({ message: "Não é possível excluir: o técnico possui ordens de serviço." });
        }
        console.error("Error deleting technician:", error);
        return res.status(500).json({ message: "Erro ao excluir técnico." });
    }
}

module.exports = {
    getAllTechnicians,
    getTechnicianById,
    createTechnician,
    updateTechnician,
    deleteTechnician
};
