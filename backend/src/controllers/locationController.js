const locationService = require("../services/locationService");

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

// Limpa os dados
function readLocationData(body) {
    return {
        name: cleanText(body.name),
        zipCode: cleanText(body.zipCode).replace(/\D/g, ""),
        street: cleanText(body.street),
        number: cleanText(body.number),
        complement: cleanText(body.complement) || null,
        neighborhood: cleanText(body.neighborhood) || null,
        city: cleanText(body.city),
        state: cleanText(body.state).toUpperCase()
    };
}

// Valida os dados
function validateLocationData(data) {
    if (!data.name) {
        return "Informe o nome do local.";
    }
    if (data.zipCode.length !== 8) {
        return "Informe um CEP válido com 8 dígitos.";
    }
    if (!data.street) {
        return "Informe a rua.";
    }
    if (!data.number) {
        return "Informe o número.";
    }
    if (!data.city) {
        return "Informe a cidade.";
    }
    if (!/^[A-Z]{2}$/.test(data.state)) {
        return "Informe a UF com 2 letras.";
    }
    return null;
}

async function getAllLocations(req, res) {
    try {
        const locations = await locationService.getAllLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).json({ message: "Erro ao buscar locais." });
    }
}

async function getLocationById(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        const location = await locationService.getLocationById(id);

        if (!location) {
            return res.status(404).json({ message: "Local não encontrado." });
        }

        return res.json(location);
    } catch (error) {
        console.error("Error fetching location:", error);
        return res.status(500).json({ message: "Erro ao buscar local." });
    }
}

async function createLocation(req, res) {
    const data = readLocationData(req.body);
    const validationError = validateLocationData(data);

    if (validationError) {
        console.warn("Invalid location data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const location = await locationService.createLocation(data);
        return res.status(201).json(location);
    } catch (error) {
        console.error("Error creating location:", error);
        return res.status(500).json({ message: "Erro ao criar local." });
    }
}

async function updateLocation(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const data = readLocationData(req.body);
    const validationError = validateLocationData(data);

    if (validationError) {
        console.warn("Invalid location data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const location = await locationService.updateLocation(id, data);
        return res.json(location);
    } catch (error) {
        // P2025: não encontrado
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Local não encontrado." });
        }
        console.error("Error updating location:", error);
        return res.status(500).json({ message: "Erro ao atualizar local." });
    }
}

async function deleteLocation(req, res) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        await locationService.deleteLocation(id);
        return res.status(204).end();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Local não encontrado." });
        }
        console.error("Error deleting location:", error);
        return res.status(500).json({ message: "Erro ao excluir local." });
    }
}

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
};
