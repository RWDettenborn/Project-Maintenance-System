import { requireAuth, setupLogout, apiFetch } from "./auth.js";
import { API_BASE_URL } from "./config.js";

const equipmentsUrl = `${API_BASE_URL}/equipments`;
const STATUS_LABELS = { active: "Ativo", maintenance: "Em manutenção", inactive: "Inativo" };
const ORDER_TYPE_LABELS = { corrective: "Corretiva", preventive: "Preventiva" };
const ORDER_PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta" };
const ORDER_STATUS_LABELS = { open: "Aberta", in_progress: "Em andamento", completed: "Concluída" };
const equipments = [];
let editingEquipmentId = null;

// Elementos da tela
const userInfo = document.querySelector("#userInfo");
const logoutButton = document.querySelector("#logoutButton");
const equipmentsTable = document.querySelector("#equipmentsTable");
const emptyMessage = document.querySelector("#emptyMessage");
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchButton");
const newEquipmentButton = document.querySelector("#newEquipmentButton");
const saveEquipmentButton = document.querySelector("#saveEquipmentButton");
const equipmentNameInput = document.querySelector("#equipmentName");
const equipmentPatrimonyInput = document.querySelector("#equipmentPatrimony");
const equipmentStatusSelect = document.querySelector("#equipmentStatus");
const equipmentCategorySelect = document.querySelector("#equipmentCategory");
const equipmentLocationSelect = document.querySelector("#equipmentLocation");
const equipmentAcquisitionDateInput = document.querySelector("#equipmentAcquisitionDate");
const equipmentPhotoInput = document.querySelector("#equipmentPhoto");
const equipmentPhotoPreview = document.querySelector("#equipmentPhotoPreview");
const equipmentModalTitle = document.querySelector("#equipmentModalTitle");
const equipmentModal = new bootstrap.Modal(document.querySelector("#equipmentModal"));
const historyModal = new bootstrap.Modal(document.querySelector("#historyModal"));
const historyModalTitle = document.querySelector("#historyModalTitle");
const historyTable = document.querySelector("#historyTable");
const historyEmptyMessage = document.querySelector("#historyEmptyMessage");

// Página protegida
requireAuth((user) => {
    userInfo.textContent = `Usuário: ${user.email}`;
    loadCategories();
    loadLocations();
    loadEquipments();
});
setupLogout(logoutButton);

// Data em UTC
function formatDate(value) {
    if (!value) {
        return "-";
    }
    return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function showPhotoPreview(url) {
    equipmentPhotoPreview.classList.toggle("d-none", !url);
    equipmentPhotoPreview.src = url || "";
}

function renderEquipmentsTable(list) {
    equipmentsTable.innerHTML = "";
    emptyMessage.classList.toggle("d-none", list.length > 0);

    list.forEach((equipment) => {
        const row = document.createElement("tr");

        const photoCell = document.createElement("td");
        if (equipment.photoUrl) {
            const photo = document.createElement("img");
            photo.src = equipment.photoUrl;
            photo.alt = `Foto de ${equipment.name}`;
            photo.className = "equipment-photo";
            photoCell.appendChild(photo);
        } else {
            photoCell.textContent = "-";
        }

        const nameCell = document.createElement("td");
        nameCell.textContent = equipment.name;

        const patrimonyCell = document.createElement("td");
        patrimonyCell.textContent = equipment.patrimony;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = equipment.category?.name ?? "-";

        const locationCell = document.createElement("td");
        locationCell.textContent = equipment.location?.name ?? "-";

        const acquisitionCell = document.createElement("td");
        acquisitionCell.textContent = formatDate(equipment.acquisitionDate);

        const statusCell = document.createElement("td");
        statusCell.textContent = STATUS_LABELS[equipment.status] ?? equipment.status;

        const actionCell = document.createElement("td");
        actionCell.className = "text-end text-nowrap";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-primary btn-sm me-2 admin-only";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openEditModal(equipment));

        const historyButton = document.createElement("button");
        historyButton.type = "button";
        historyButton.className = "btn btn-outline-secondary btn-sm me-2";
        historyButton.textContent = "Histórico";
        historyButton.addEventListener("click", () => openHistoryModal(equipment));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm admin-only";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => deleteEquipment(equipment));

        actionCell.append(historyButton, editButton, deleteButton);
        row.append(photoCell, nameCell, patrimonyCell, categoryCell, locationCell, acquisitionCell, statusCell, actionCell);
        equipmentsTable.appendChild(row);
    });
}

function refreshScreen() {
    searchEquipments();
}

async function loadEquipments() {
    try {
        const response = await apiFetch(equipmentsUrl);
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

async function loadCategories() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error("Could not load categories");
        }

        const categories = await response.json();
        categories.forEach((category) => {
            equipmentCategorySelect.appendChild(new Option(category.name, category.id));
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

async function loadLocations() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/locations`);
        if (!response.ok) {
            throw new Error("Could not load locations");
        }

        const locations = await response.json();
        locations.forEach((location) => {
            equipmentLocationSelect.appendChild(new Option(location.name, location.id));
        });
    } catch (error) {
        console.error("Error loading locations:", error);
    }
}

function openCreateModal() {
    editingEquipmentId = null;
    equipmentModalTitle.textContent = "Novo Equipamento";
    equipmentNameInput.value = "";
    equipmentPatrimonyInput.value = "";
    equipmentStatusSelect.value = "active";
    equipmentCategorySelect.value = "";
    equipmentLocationSelect.value = "";
    equipmentAcquisitionDateInput.value = "";
    equipmentPhotoInput.value = "";
    showPhotoPreview(null);
    equipmentModal.show();
}

function openEditModal(equipment) {
    editingEquipmentId = equipment.id;
    equipmentModalTitle.textContent = "Editar Equipamento";
    equipmentNameInput.value = equipment.name;
    equipmentPatrimonyInput.value = equipment.patrimony;
    equipmentStatusSelect.value = equipment.status;
    equipmentCategorySelect.value = equipment.categoryId ?? "";
    equipmentLocationSelect.value = equipment.locationId ?? "";
    equipmentAcquisitionDateInput.value = equipment.acquisitionDate ? equipment.acquisitionDate.slice(0, 10) : "";
    equipmentPhotoInput.value = "";
    showPhotoPreview(equipment.photoUrl);
    equipmentModal.show();
}

async function saveEquipment() {
    const name = equipmentNameInput.value.trim();
    const patrimony = equipmentPatrimonyInput.value.trim();

    if (!name || !patrimony) {
        console.warn("Equipment name or patrimony not provided");
        alert("Informe o nome e o patrimônio do equipamento.");
        return;
    }

    const isEditing = editingEquipmentId !== null;
    const url = isEditing ? `${equipmentsUrl}/${editingEquipmentId}` : equipmentsUrl;

    saveEquipmentButton.disabled = true;
    try {
        const response = await apiFetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                patrimony,
                status: equipmentStatusSelect.value,
                categoryId: equipmentCategorySelect.value || null,
                locationId: equipmentLocationSelect.value || null,
                acquisitionDate: equipmentAcquisitionDateInput.value || null
            })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível salvar o equipamento.");
        }

        // Envia a foto
        let photoError = null;
        if (equipmentPhotoInput.files.length > 0) {
            try {
                await uploadPhoto(result.id, equipmentPhotoInput.files[0]);
            } catch (error) {
                photoError = error;
            }
        }

        equipmentModal.hide();
        await loadEquipments();
        if (photoError) {
            console.error("Error uploading photo:", photoError);
            alert(photoError.message);
        }
    } catch (error) {
        console.error("Error saving equipment:", error);
        alert(error.message || "Não foi possível salvar o equipamento.");
    } finally {
        saveEquipmentButton.disabled = false;
    }
}

// Histórico de manutenções
async function openHistoryModal(equipment) {
    historyModalTitle.textContent = `Histórico de manutenções - ${equipment.name}`;
    historyTable.innerHTML = "";
    historyEmptyMessage.classList.add("d-none");

    try {
        const response = await apiFetch(`${API_BASE_URL}/service-orders?equipmentId=${equipment.id}`);
        if (!response.ok) {
            throw new Error("Não foi possível carregar o histórico.");
        }

        const orders = await response.json();
        historyEmptyMessage.classList.toggle("d-none", orders.length > 0);

        orders.forEach((order) => {
            const row = document.createElement("tr");
            const values = [
                formatDate(order.openedAt),
                ORDER_TYPE_LABELS[order.type] ?? order.type,
                ORDER_PRIORITY_LABELS[order.priority] ?? order.priority,
                order.technician?.name ?? "-",
                order.description,
                ORDER_STATUS_LABELS[order.status] ?? order.status,
                formatDate(order.completedAt)
            ];
            values.forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            historyTable.appendChild(row);
        });
        historyModal.show();
    } catch (error) {
        console.error("Error loading maintenance history:", error);
        alert(error.message || "Não foi possível carregar o histórico.");
    }
}

async function uploadPhoto(equipmentId, file) {
    const formData = new FormData();
    formData.append("photo", file);

    // Sem Content-Type
    const response = await apiFetch(`${equipmentsUrl}/${equipmentId}/photo`, {
        method: "POST",
        body: formData
    });
    if (!response.ok) {
        const result = await response.json();
        throw new Error(`O equipamento foi salvo, mas a foto não: ${result.message || "erro ao enviar a foto."}`);
    }
}

async function deleteEquipment(equipment) {
    if (!confirm(`Excluir o equipamento "${equipment.name}"?`)) {
        return;
    }

    try {
        const response = await apiFetch(`${equipmentsUrl}/${equipment.id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Não foi possível excluir o equipamento.");
        }
        await loadEquipments();
    } catch (error) {
        console.error("Error deleting equipment:", error);
        alert(error.message || "Não foi possível excluir o equipamento.");
    }
}

// Pesquisa local
function searchEquipments() {
    const term = searchInput.value.trim().toLowerCase();
    const result = equipments.filter((equipment) =>
        equipment.name.toLowerCase().includes(term) ||
        equipment.patrimony.toLowerCase().includes(term));
    renderEquipmentsTable(result);
}

equipmentPhotoInput.addEventListener("change", () => {
    const file = equipmentPhotoInput.files[0];
    showPhotoPreview(file ? URL.createObjectURL(file) : null);
});
searchInput.addEventListener("input", searchEquipments);
searchButton.addEventListener("click", searchEquipments);
newEquipmentButton.addEventListener("click", openCreateModal);
saveEquipmentButton.addEventListener("click", saveEquipment);

console.log("Equipments page loaded");
