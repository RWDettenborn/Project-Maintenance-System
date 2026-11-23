const { createClient } = require("@supabase/supabase-js");

const BUCKET = process.env.SUPABASE_BUCKET || "equipment-photos";

let client = null;

// The Supabase client is created only when it is needed (first photo upload).
function getClient() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not configured");
    }
    if (!client) {
        client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    return client;
}

// Sends the image to the Supabase Storage bucket and returns its public URL.
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

// Removes an old photo from the bucket. It never throws: a failure here must not block the request.
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
