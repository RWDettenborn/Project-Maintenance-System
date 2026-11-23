const prisma = require("../database/prisma");

// Dados relacionados
const include = { category: true, location: true };

async function getAllEquipments() {
    return await prisma.equipment.findMany({
        include,
        orderBy: { id: "desc" }
    });
}

async function getEquipmentById(id) {
    return await prisma.equipment.findUnique({
        where: { id },
        include
    });
}

async function createEquipment(data) {
    return await prisma.equipment.create({
        data,
        include
    });
}

async function updateEquipment(id, data) {
    return await prisma.equipment.update({
        where: { id },
        data,
        include
    });
}

async function updateEquipmentPhoto(id, photoUrl) {
    return await prisma.equipment.update({
        where: { id },
        data: { photoUrl },
        include
    });
}

async function deleteEquipment(id) {
    return await prisma.equipment.delete({
        where: { id }
    });
}

module.exports = {
    getAllEquipments,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    updateEquipmentPhoto,
    deleteEquipment
};
