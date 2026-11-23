const { createClient } = require("@supabase/supabase-js");

const BUCKET = process.env.SUPABASE_BUCKET || "equipment-photos";

let client = null;

// Cliente sob demanda
function getClient() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured");
    }
    if (!client) {
        client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    return client;
}

// Envia a foto
async function uploadEquipmentPhoto(equipmentId, file) {
    const extension = file.mimetype.split("/")[1].replace("jpeg", "jpg");
    const filePath = `equipment-${equipmentId}-${Date.now()}.${extension}`;
    const storage = getClient().storage.from(BUCKET);

    const { error } = await storage.upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
    });
    if (error) {
        throw error;
    }

    return storage.getPublicUrl(filePath).data.publicUrl;
}

// Remove a foto
async function deleteEquipmentPhoto(photoUrl) {
    if (!photoUrl) {
        return;
    }
    try {
        const marker = `/${BUCKET}/`;
        const index = photoUrl.indexOf(marker);
        if (index === -1) {
            return;
        }
        const filePath = decodeURIComponent(photoUrl.slice(index + marker.length));
        await getClient().storage.from(BUCKET).remove([filePath]);
    } catch (error) {
        console.error("Error deleting photo from storage:", error);
    }
}

module.exports = { uploadEquipmentPhoto, deleteEquipmentPhoto };
