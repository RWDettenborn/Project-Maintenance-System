import { signOut, onAuthStateChanged } from
'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

import { auth } from "./firebase.js";
import { API_BASE_URL } from "./config.js";

const equipmentsUrl = `${API_BASE_URL}/equipments`;
const equipments = [];

// DOM elements
const logoutButton = document.querySelector("#logoutButton");
const userInfo = document.querySelector("#userInfo");
const activesTotal = document.querySelector("#activesTotal");
const preventivesTotal = document.querySelector("#preventivesTotal");
const maintenanceEquipmentsTotal = document.querySelector("#maintenanceEquipmentsTotal");
const equipmentsTable = document.querySelector("#equipmentsTable");
const searchInput = document.querySelector("#searchInput");
const newEquipmentButton = document.querySelector("#newEquipmentButton");
const saveEquipmentButton = document.querySelector("#saveEquipmentButton");
const equipmentNameInput = document.querySelector("#equipmentName");
const equipmentPatrimonyInput = document.querySelector("#equipmentPatrimony");
const equipmentModal = new bootstrap.Modal(document.querySelector("#equipmentModal"));

// Protected page: redirect to login when there is no authenticated user
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login.html";
        return;
    }
    userInfo.textContent = `Usuário: ${user.email}`;
    loadEquipments();
});

logoutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "../login.html";
    } catch (error) {
        console.error("Error signing out:", error.code);
        alert("Não foi possível encerrar a sessão. Tente novamente.");
    }
});

function updateIndicators() {
    const countByStatus = (status) =>
        equipments.filter((equipment) => equipment.status === status).length;

    activesTotal.textContent = countByStatus("active");
    maintenanceEquipmentsTotal.textContent = countByStatus("maintenance");
    // Preventive maintenance count will come from service orders (future module).
    preventivesTotal.textContent = 0;
}

function renderEquipmentsTable(list) {
    equipmentsTable.innerHTML = "";

    list.forEach((equipment) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = equipment.name;

        const locationCell = document.createElement("td");
        locationCell.textContent = equipment.location ?? "-";

        const statusCell = document.createElement("td");
        statusCell.textContent = equipment.status;

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => deleteEquipment(equipment.id));
        actionCell.appendChild(deleteButton);

        row.append(nameCell, locationCell, statusCell, actionCell);
        equipmentsTable.appendChild(row);
    });
}

function refreshScreen() {
    renderEquipmentsTable(equipments);
    updateIndicators();
}

async function loadEquipments() {
    try {
        const response = await fetch(equipmentsUrl);
        if (!response.ok) {
            throw new Error("Não foi possível carregar os equipamentos.");
        }

        const data = await response.json();
        equipments.splice(0, equipments.length, ...data);
        refreshScreen();
    } catch (error) {
        console.error("Error loading equipments:", error);
        alert(error.message || "Não foi possível carregar os equipamentos.");
    }
}

async function createEquipment() {
    const name = equipmentNameInput.value.trim();
    const patrimony = equipmentPatrimonyInput.value.trim();

    if (!name || !patrimony) {
        console.warn("Equipment name or patrimony not provided");
        alert("Informe o nome e o patrimônio do equipamento.");
        return;
    }

    saveEquipmentButton.disabled = true;
    try {
        const response = await fetch(equipmentsUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, patrimony })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível salvar o equipamento.");
        }

        equipments.unshift(result);
        refreshScreen();
        equipmentModal.hide();
        equipmentNameInput.value = "";
        equipmentPatrimonyInput.value = "";
    } catch (error) {
        console.error("Error saving equipment:", error);
        alert(error.message || "Não foi possível salvar o equipamento.");
    } finally {
        saveEquipmentButton.disabled = false;
    }
}

async function deleteEquipment(id) {
    try {
        const response = await fetch(`${equipmentsUrl}/${id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Não foi possível excluir o equipamento.");
        }

        const index = equipments.findIndex((equipment) => equipment.id === id);
        if (index !== -1) {
            equipments.splice(index, 1);
            refreshScreen();
        }
    } catch (error) {
        console.error("Error deleting equipment:", error);
        alert(error.message || "Não foi possível excluir o equipamento.");
    }
}

function searchEquipments() {
    const term = searchInput.value.toLowerCase();
    const result = equipments.filter((equipment) =>
        equipment.name.toLowerCase().includes(term));
    renderEquipmentsTable(result);
}

searchInput.addEventListener("input", searchEquipments);
newEquipmentButton.addEventListener("click", () => equipmentModal.show());
saveEquipmentButton.addEventListener("click", createEquipment);

console.log("Dashboard loaded");
