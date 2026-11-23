const prisma = require("../database/prisma");

// Every service order is returned together with its equipment and technician.
const include = { equipment: true, technician: true };

// Business rule: the equipment status follows its service orders.
// - at least one order not completed -> equipment is "maintenance"
// - no pending order left            -> equipment goes back to "active"
// "tx" is the transaction client, so everything succeeds or fails together.
async function syncEquipmentStatus(tx, equipmentId) {
    const pendingOrders = await tx.serviceOrder.count({
        where: { equipmentId, status: { not: "completed" } }
    });

    if (pendingOrders > 0) {
        await tx.equipment.update({
            where: { id: equipmentId },
            data: { status: "maintenance" }
        });
        return;
    }

    // Only equipment that was in maintenance returns to active (an inactive one stays inactive).
    await tx.equipment.updateMany({
        where: { id: equipmentId, status: "maintenance" },
        data: { status: "active" }
    });
}

async function getAllServiceOrders(filters = {}) {
    return await prisma.serviceOrder.findMany({
        where: filters,
        include,
        orderBy: { openedAt: "desc" }
    });
}

async function getServiceOrderById(id) {
    return await prisma.serviceOrder.findUnique({
        where: { id },
        include
    });
}

async function createServiceOrder(data) {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.serviceOrder.create({ data, include });
        await syncEquipmentStatus(tx, order.equipmentId);
        return order;
    });
}

async function updateServiceOrder(id, data) {
    return await prisma.serviceOrder.update({
        where: { id },
        data,
        include
    });
}

async function changeServiceOrderStatus(id, status) {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.serviceOrder.update({
            where: { id },
            data: {
                status,
                completedAt: status === "completed" ? new Date() : null
            },
            include
        });
        await syncEquipmentStatus(tx, order.equipmentId);
        return order;
    });
}

async function deleteServiceOrder(id) {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.serviceOrder.delete({ where: { id } });
        await syncEquipmentStatus(tx, order.equipmentId);
        return order;
    });
}

module.exports = {
    getAllServiceOrders,
    getServiceOrderById,
    createServiceOrder,
    updateServiceOrder,
    changeServiceOrderStatus,
    deleteServiceOrder
};
