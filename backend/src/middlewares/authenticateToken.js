const { firebaseAdminAuth } = require("../firebaseAdmin");

// Define o perfil
function getRole(email) {
    const admins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    if (admins.length === 0 || admins.includes((email || "").toLowerCase())) {
        return "admin";
    }
    return "technician";
}

// Valida o token
async function authenticateToken(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Acesso negado. Faça login novamente." });
    }

    try {
        const decoded = await firebaseAdminAuth.verifyIdToken(token);
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            role: getRole(decoded.email)
        };
        return next();
    } catch (error) {
        console.warn("Invalid Firebase token:", error.code || error.message);
        return res.status(401).json({ message: "Sessão inválida ou expirada. Faça login novamente." });
    }
}

module.exports = { authenticateToken, getRole };
