const multer = require("multer");

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// The file stays in memory (req.file.buffer) and is sent to the Supabase Storage by the service.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE_BYTES },
    fileFilter: (req, file, callback) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return callback(new Error("INVALID_FILE_TYPE"));
        }
        callback(null, true);
    }
}).single("photo");

// Wraps multer to answer with friendly pt-BR messages when the file is not accepted.
function uploadPhoto(req, res, next) {
    upload(req, res, (error) => {
        if (!error) {
            return next();
        }
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "A foto deve ter no máximo 2 MB." });
        }
        if (error.message === "INVALID_FILE_TYPE") {
            return res.status(400).json({ message: "Envie uma imagem JPG, PNG ou WEBP." });
        }
        console.error("Error reading the uploaded file:", error);
        return res.status(400).json({ message: "Não foi possível ler o arquivo enviado." });
    });
}

module.exports = uploadPhoto;
