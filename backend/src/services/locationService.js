const prisma = require("../database/prisma");

async function getAllLocations() {
    return await prisma.location.findMany({
        orderBy: { name: "asc" }
    });
}

async function getLocationById(id) {
    return await prisma.location.findUnique({
        where: { id }
    });
}

async function createLocation(data) {
    return await prisma.location.create({
        data
    });
}

async function updateLocation(id, data) {
    return await prisma.location.update({
        where: { id },
        data
    });
}

async function deleteLocation(id) {
    return await prisma.location.delete({
        where: { id }
    });
}

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
};
