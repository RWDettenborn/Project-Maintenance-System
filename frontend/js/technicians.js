import { requireAuth, setupLogout, apiFetch } from "./auth.js";
import { API_BASE_URL } from "./config.js";

const techniciansUrl = `${API_BASE_URL}/technicians`;
const technicians = [];
let editingTechnicianId = null;

// Elementos da tela
const userInfo = document.querySelector("#userInfo");
const logoutButton = document.querySelector("#logoutButton");
const techniciansTable = document.querySelector("#techniciansTable");
const emptyMessage = document.querySelector("#emptyMessage");
const newTechnicianButton = document.querySelector("#newTechnicianButton");
const saveTechnicianButton = document.querySelector("#saveTechnicianButton");
const technicianNameInput = document.querySelector("#technicianName");
const technicianPhoneInput = document.querySelector("#technicianPhone");
const technicianEmailInput = document.querySelector("#technicianEmail");
const technicianSpecialtyInput = document.querySelector("#technicianSpecialty");
const technicianModalTitle = document.querySelector("#technicianModalTitle");
const technicianModal = new bootstrap.Modal(document.querySelector("#technicianModal"));

// Página protegida
requireAuth((user) => {
    userInfo.textContent = `Usuário: ${user.email}`;
    loadTechnicians();
});
setupLogout(logoutButton);

function renderTechniciansTable() {
    techniciansTable.innerHTML = "";
    emptyMessage.classList.toggle("d-none", technicians.length > 0);

    technicians.forEach((technician) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = technician.name;

        const phoneCell = document.createElement("td");
        phoneCell.textContent = technician.phone;

        const emailCell = document.createElement("td");
        emailCell.textContent = technician.email;

        const specialtyCell = document.createElement("td");
        specialtyCell.textContent = technician.specialty;

        const actionCell = document.createElement("td");
        actionCell.className = "text-end text-nowrap";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-primary btn-sm me-2 admin-only";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openEditModal(technician));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm admin-only";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => deleteTechnician(technician));

        actionCell.append(editButton, deleteButton);
        row.append(nameCell, phoneCell, emailCell, specialtyCell, actionCell);
        techniciansTable.appendChild(row);
    });
}

async function loadTechnicians() {
    try {
        const response = await apiFetch(techniciansUrl);
        if (!response.ok) {
            throw new Error("Não foi possível carregar os técnicos.");
        }
        const data = await response.json();
        technicians.splice(0, technicians.length, ...data);
        renderTechniciansTable();
    } catch (error) {
        console.error("Error loading technicians:", error);
        alert(error.message || "Não foi possível carregar os técnicos.");
    }
}

function openCreateModal() {
    editingTechnicianId = null;
    technicianModalTitle.textContent = "Novo Técnico";
    technicianNameInput.value = "";
    technicianPhoneInput.value = "";
    technicianEmailInput.value = "";
    technicianSpecialtyInput.value = "";
    technicianModal.show();
}

function openEditModal(technician) {
    editingTechnicianId = technician.id;
    technicianModalTitle.textContent = "Editar Técnico";
    technicianNameInput.value = technician.name;
    technicianPhoneInput.value = technician.phone;
    technicianEmailInput.value = technician.email;
    technicianSpecialtyInput.value = technician.specialty;
    technicianModal.show();
}

async function saveTechnician() {
    const name = technicianNameInput.value.trim();
    const phone = technicianPhoneInput.value.trim();
    const email = technicianEmailInput.value.trim();
    const specialty = technicianSpecialtyInput.value.trim();

    if (!name || !phone || !email || !specialty) {
        console.warn("Technician fields not completely filled");
        alert("Preencha nome, telefone, e-mail e especialidade.");
        return;
    }

    const isEditing = editingTechnicianId !== null;
    const url = isEditing ? `${techniciansUrl}/${editingTechnicianId}` : techniciansUrl;

    saveTechnicianButton.disabled = true;
    try {
        const response = await apiFetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, specialty })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível salvar o técnico.");
        }

        technicianModal.hide();
        await loadTechnicians();
    } catch (error) {
        console.error("Error saving technician:", error);
        alert(error.message || "Não foi possível salvar o técnico.");
    } finally {
        saveTechnicianButton.disabled = false;
    }
}

async function deleteTechnician(technician) {
    if (!confirm(`Excluir o técnico "${technician.name}"?`)) {
        return;
    }

    try {
        const response = await apiFetch(`${techniciansUrl}/${technician.id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Não foi possível excluir o técnico.");
        }
        await loadTechnicians();
    } catch (error) {
        console.error("Error deleting technician:", error);
        alert(error.message || "Não foi possível excluir o técnico.");
    }
}

newTechnicianButton.addEventListener("click", openCreateModal);
saveTechnicianButton.addEventListener("click", saveTechnician);

console.log("Technicians page loaded");
