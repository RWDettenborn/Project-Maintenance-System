import { signOut, onAuthStateChanged } from
'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

import { auth } from "./firebase.js";
import { API_BASE_URL } from "./config.js";

// Fetch com token
export async function apiFetch(url, options = {}) {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    const headers = { ...(options.headers || {}) };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
}

// Carrega o perfil
async function loadRole() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/me`);
        if (!response.ok) {
            throw new Error("Could not load the user role");
        }
        const profile = await response.json();
        document.body.dataset.role = profile.role;
    } catch (error) {
        console.error("Error loading the user role:", error);
    }
}

// Páginas protegidas
export function requireAuth(onAuthenticated) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "../login.html";
            return;
        }
        await loadRole();
        onAuthenticated(user);
    });
}

export function setupLogout(button) {
    button.addEventListener("click", async () => {
        try {
            await signOut(auth);
            window.location.href = "../login.html";
        } catch (error) {
            console.error("Error signing out:", error.code);
            alert("Não foi possível encerrar a sessão. Tente novamente.");
        }
    });
}
