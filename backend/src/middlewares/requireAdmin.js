// Só administradores
function requireAdmin(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Acesso restrito a administradores." });
}

module.exports = requireAdmin;
