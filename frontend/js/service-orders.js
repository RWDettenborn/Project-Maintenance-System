import { requireAuth, setupLogout, apiFetch } from "./auth.js";
import { API_BASE_URL } from "./config.js";

const serviceOrdersUrl = `${API_BASE_URL}/service-orders`;
const serviceOrders = [];
let editingServiceOrderId = null;

// Textos exibidos
const TYPE_LABELS = { corrective: "Corretiva", preventive: "Preventiva" };
const PRIORITY_LABELS = { low: "Baixa", medium: "Média", high: "Alta" };
const STATUS_LABELS = { open: "Aberta", in_progress: "Em andamento", completed: "Concluída" };

// Elementos da tela
const userInfo = document.querySelector("#userInfo");
const logoutButton = document.querySelector("#logoutButton");
const serviceOrdersTable = document.querySelector("#serviceOrdersTable");
const emptyMessage = document.querySelector("#emptyMessage");
const filterEquipmentSelect = document.querySelector("#filterEquipment");
const filterStatusSelect = document.querySelector("#filterStatus");
const newServiceOrderButton = document.querySelector("#newServiceOrderButton");
const saveServiceOrderButton = document.querySelector("#saveServiceOrderButton");
const orderEquipmentSelect = document.querySelector("#orderEquipment");
const orderTechnicianSelect = document.querySelector("#orderTechnician");
const orderTypeSelect = document.querySelector("#orderType");
const orderPrioritySelect = document.querySelector("#orderPriority");
const orderDateInput = document.querySelector("#orderDate");
const orderDescriptionInput = document.querySelector("#orderDescription");
const serviceOrderModalTitle = document.querySelector("#serviceOrderModalTitle");
const serviceOrderModal = new bootstrap.Modal(document.querySelector("#serviceOrderModal"));

// Página protegida
requireAuth((user) => {
    userInfo.textContent = `Usuário: ${user.email}`;
    loadEquipmentOptions();
    loadTechnicianOptions();
    loadServiceOrders();
});
setupLogout(logoutButton);

// Data de hoje
function getTodayDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}

// Data em UTC
function formatDate(value) {
    return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

// Preenche os selects
async function loadEquipmentOptions() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/equipments`);
        if (!response.ok) {
            throw new Error("Could not load equipments");
        }
        const equipments = await response.json();

        equipments.forEach((equipment) => {
            const text = `${equipment.name} (${equipment.patrimony})`;
            orderEquipmentSelect.appendChild(new Option(text, equipment.id));
            filterEquipmentSelect.appendChild(new Option(text, equipment.id));
        });
    } catch (error) {
        console.error("Error loading equipment options:", error);
    }
}

async function loadTechnicianOptions() {
    try {
        const response = await apiFetch(`${API_BASE_URL}/technicians`);
        if (!response.ok) {
            throw new Error("Could not load technicians");
        }
        const technicians = await response.json();

        technicians.forEach((technician) => {
            const text = `${technician.name} - ${technician.specialty}`;
            orderTechnicianSelect.appendChild(new Option(text, technician.id));
        });
    } catch (error) {
        console.error("Error loading technician options:", error);
    }
}

function renderServiceOrdersTable() {
    serviceOrdersTable.innerHTML = "";
    emptyMessage.classList.toggle("d-none", serviceOrders.length > 0);

    serviceOrders.forEach((order) => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = order.id;

        const equipmentCell = document.createElement("td");
        equipmentCell.textContent = order.equipment?.name ?? "-";

        const technicianCell = document.createElement("td");
        technicianCell.textContent = order.technician?.name ?? "-";

        const typeCell = document.createElement("td");
        typeCell.textContent = TYPE_LABELS[order.type] ?? order.type;

        const priorityCell = document.createElement("td");
        priorityCell.textContent = PRIORITY_LABELS[order.priority] ?? order.priority;

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(order.openedAt);

        const statusCell = document.createElement("td");
        statusCell.textContent = STATUS_LABELS[order.status] ?? order.status;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = order.description;

        const actionCell = document.createElement("td");
        actionCell.className = "text-end text-nowrap";

        // Botões por status
        if (order.status === "open") {
            const startButton = document.createElement("button");
            startButton.type = "button";
            startButton.className = "btn btn-outline-warning btn-sm me-2";
            startButton.textContent = "Iniciar";
            startButton.addEventListener("click", () => changeStatus(order, "in_progress"));
            actionCell.appendChild(startButton);
        }

        if (order.status !== "completed") {
            const completeButton = document.createElement("button");
            completeButton.type = "button";
            completeButton.className = "btn btn-outline-success btn-sm me-2";
            completeButton.textContent = "Concluir";
            completeButton.addEventListener("click", () => changeStatus(order, "completed"));
            actionCell.appendChild(completeButton);
        }

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-primary btn-sm me-2 admin-only";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openEditModal(order));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm admin-only";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => deleteServiceOrder(order));

        actionCell.append(editButton, deleteButton);
        row.append(idCell, equipmentCell, technicianCell, typeCell, priorityCell, dateCell, statusCell, descriptionCell, actionCell);
        serviceOrdersTable.appendChild(row);
    });
}

// Carrega com filtros
async function loadServiceOrders() {
    const params = new URLSearchParams();

    if (filterEquipmentSelect.value) {
        params.append("equipmentId", filterEquipmentSelect.value);
    }
    if (filterStatusSelect.value) {
        params.append("status", filterStatusSelect.value);
    }

    const queryString = params.toString();
    const url = queryString ? `${serviceOrdersUrl}?${queryString}` : serviceOrdersUrl;

    try {
        const response = await apiFetch(url);
        if (!response.ok) {
            throw new Error("Não foi possível carregar as ordens de serviço.");
        }
        const data = await response.json();
        serviceOrders.splice(0, serviceOrders.length, ...data);
        renderServiceOrdersTable();
    } catch (error) {
        console.error("Error loading service orders:", error);
        alert(error.message || "Não foi possível carregar as ordens de serviço.");
    }
}

function openCreateModal() {
    editingServiceOrderId = null;
    serviceOrderModalTitle.textContent = "Abrir Ordem de Serviço";
    orderEquipmentSelect.value = "";
    orderEquipmentSelect.disabled = false;
    orderTechnicianSelect.value = "";
    orderTypeSelect.value = "corrective";
    orderPrioritySelect.value = "medium";
    orderDateInput.value = getTodayDate();
    orderDescriptionInput.value = "";
    serviceOrderModal.show();
}

function openEditModal(order) {
    editingServiceOrderId = order.id;
    serviceOrderModalTitle.textContent = "Editar Ordem de Serviço";
    orderEquipmentSelect.value = order.equipmentId;
    orderEquipmentSelect.disabled = true; // Equipamento não muda
    orderTechnicianSelect.value = order.technicianId;
    orderTypeSelect.value = order.type;
    orderPrioritySelect.value = order.priority;
    orderDateInput.value = order.openedAt.slice(0, 10);
    orderDescriptionInput.value = order.description;
    serviceOrderModal.show();
}

async function saveServiceOrder() {
    const isEditing = editingServiceOrderId !== null;

    const data = {
        equipmentId: orderEquipmentSelect.value,
        technicianId: orderTechnicianSelect.value,
        type: orderTypeSelect.value,
        priority: orderPrioritySelect.value,
        openedAt: orderDateInput.value,
        description: orderDescriptionInput.value.trim()
    };

    if ((!isEditing && !data.equipmentId) || !data.technicianId || !data.openedAt || !data.description) {
        console.warn("Service order required fields not filled");
        alert("Preencha equipamento, técnico, data e descrição.");
        return;
    }

    const url = isEditing ? `${serviceOrdersUrl}/${editingServiceOrderId}` : serviceOrdersUrl;

    saveServiceOrderButton.disabled = true;
    try {
        const response = await apiFetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível salvar a ordem de serviço.");
        }

        serviceOrderModal.hide();
        await loadServiceOrders();
    } catch (error) {
        console.error("Error saving service order:", error);
        alert(error.message || "Não foi possível salvar a ordem de serviço.");
    } finally {
        saveServiceOrderButton.disabled = false;
    }
}

// Altera o status
async function changeStatus(order, status) {
    try {
        const response = await apiFetch(`${serviceOrdersUrl}/${order.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível alterar o status.");
        }
        await loadServiceOrders();
    } catch (error) {
        console.error("Error changing service order status:", error);
        alert(error.message || "Não foi possível alterar o status.");
    }
}

async function deleteServiceOrder(order) {
    if (!confirm(`Excluir a ordem de serviço #${order.id}?`)) {
        return;
    }

    try {
        const response = await apiFetch(`${serviceOrdersUrl}/${order.id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Não foi possível excluir a ordem de serviço.");
        }
        await loadServiceOrders();
    } catch (error) {
        console.error("Error deleting service order:", error);
        alert(error.message || "Não foi possível excluir a ordem de serviço.");
    }
}

newServiceOrderButton.addEventListener("click", openCreateModal);
saveServiceOrderButton.addEventListener("click", saveServiceOrder);
// Recarrega ao filtrar
filterEquipmentSelect.addEventListener("change", loadServiceOrders);
filterStatusSelect.addEventListener("change", loadServiceOrders);

console.log("Service orders page loaded");
