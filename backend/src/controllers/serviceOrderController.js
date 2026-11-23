const serviceOrderService = require("../services/serviceOrderService");

const VALID_PRIORITIES = ["low", "medium", "high"];
const VALID_TYPES = ["corrective", "preventive"];
const VALID_STATUSES = ["open", "in_progress", "completed"];

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

// Converte para id
function toId(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : null;
}

function readServiceOrderData(body) {
    return {
        equipmentId: toId(body.equipmentId),
        technicianId: toId(body.technicianId),
        description: cleanText(body.description),
        priority: body.priority || "medium",
        type: body.type || "corrective",
        openedAt: body.openedAt ? new Date(body.openedAt) : undefined
    };
}

// Valida os dados
function validateServiceOrderData(data, isCreation) {
    if (isCreation && !data.equipmentId) {
        return "Selecione o equipamento.";
    }
    if (!data.technicianId) {
        return "Selecione o técnico.";
    }
    if (!data.description) {
        return "Informe a descrição do serviço.";
    }
    if (!VALID_PRIORITIES.includes(data.priority)) {
        return "Prioridade inválida.";
    }
    if (!VALID_TYPES.includes(data.type)) {
        return "Tipo de manutenção inválido.";
    }
    if (data.openedAt && Number.isNaN(data.openedAt.getTime())) {
        return "Data inválida.";
    }
    return null;
}

async function getAllServiceOrders(req, res) {
    const filters = {};

    // Filtros opcionais
    if (req.query.equipmentId) {
        const equipmentId = toId(req.query.equipmentId);
        if (equipmentId === null) {
            return res.status(400).json({ message: "Equipamento inválido." });
        }
        filters.equipmentId = equipmentId;
    }

    if (req.query.status) {
        if (!VALID_STATUSES.includes(req.query.status)) {
            return res.status(400).json({ message: "Status inválido." });
        }
        filters.status = req.query.status;
    }

    try {
        const orders = await serviceOrderService.getAllServiceOrders(filters);
        return res.json(orders);
    } catch (error) {
        console.error("Error fetching service orders:", error);
        return res.status(500).json({ message: "Erro ao buscar ordens de serviço." });
    }
}

async function getServiceOrderById(req, res) {
    const id = toId(req.params.id);

    if (id === null) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        const order = await serviceOrderService.getServiceOrderById(id);

        if (!order) {
            return res.status(404).json({ message: "Ordem de serviço não encontrada." });
        }

        return res.json(order);
    } catch (error) {
        console.error("Error fetching service order:", error);
        return res.status(500).json({ message: "Erro ao buscar ordem de serviço." });
    }
}

async function createServiceOrder(req, res) {
    const data = readServiceOrderData(req.body);
    const validationError = validateServiceOrderData(data, true);

    if (validationError) {
        console.warn("Invalid service order data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    try {
        const order = await serviceOrderService.createServiceOrder(data);
        return res.status(201).json(order);
    } catch (error) {
        // P2003: chave estrangeira
        if (error.code === "P2003") {
            return res.status(400).json({ message: "Equipamento ou técnico não encontrado." });
        }
        console.error("Error creating service order:", error);
        return res.status(500).json({ message: "Erro ao abrir ordem de serviço." });
    }
}

async function updateServiceOrder(req, res) {
    const id = toId(req.params.id);

    if (id === null) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const data = readServiceOrderData(req.body);
    const validationError = validateServiceOrderData(data, false);

    if (validationError) {
        console.warn("Invalid service order data:", validationError);
        return res.status(400).json({ message: validationError });
    }

    // Equipamento não muda
    delete data.equipmentId;

    try {
        const order = await serviceOrderService.updateServiceOrder(id, data);
        return res.json(order);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Ordem de serviço não encontrada." });
        }
        if (error.code === "P2003") {
            return res.status(400).json({ message: "Técnico não encontrado." });
        }
        console.error("Error updating service order:", error);
        return res.status(500).json({ message: "Erro ao atualizar ordem de serviço." });
    }
}

// Altera o status
async function changeServiceOrderStatus(req, res) {
    const id = toId(req.params.id);

    if (id === null) {
        return res.status(400).json({ message: "ID inválido." });
    }

    const status = req.body.status;

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Status inválido." });
    }

    try {
        const order = await serviceOrderService.changeServiceOrderStatus(id, status);
        return res.json(order);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Ordem de serviço não encontrada." });
        }
        console.error("Error changing service order status:", error);
        return res.status(500).json({ message: "Erro ao alterar o status da ordem de serviço." });
    }
}

async function deleteServiceOrder(req, res) {
    const id = toId(req.params.id);

    if (id === null) {
        return res.status(400).json({ message: "ID inválido." });
    }

    try {
        await serviceOrderService.deleteServiceOrder(id);
        return res.status(204).end();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Ordem de serviço não encontrada." });
        }
        console.error("Error deleting service order:", error);
        return res.status(500).json({ message: "Erro ao excluir ordem de serviço." });
    }
}

module.exports = {
    getAllServiceOrders,
    getServiceOrderById,
    createServiceOrder,
    updateServiceOrder,
    changeServiceOrderStatus,
    deleteServiceOrder
};
