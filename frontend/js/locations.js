import { requireAuth, setupLogout, apiFetch } from "./auth.js";
import { API_BASE_URL } from "./config.js";

const locationsUrl = `${API_BASE_URL}/locations`;
const locations = [];
let editingLocationId = null;

// Elementos da tela
const userInfo = document.querySelector("#userInfo");
const logoutButton = document.querySelector("#logoutButton");
const locationsTable = document.querySelector("#locationsTable");
const emptyMessage = document.querySelector("#emptyMessage");
const newLocationButton = document.querySelector("#newLocationButton");
const saveLocationButton = document.querySelector("#saveLocationButton");
const locationNameInput = document.querySelector("#locationName");
const locationZipCodeInput = document.querySelector("#locationZipCode");
const locationStreetInput = document.querySelector("#locationStreet");
const locationNumberInput = document.querySelector("#locationNumber");
const locationComplementInput = document.querySelector("#locationComplement");
const locationNeighborhoodInput = document.querySelector("#locationNeighborhood");
const locationCityInput = document.querySelector("#locationCity");
const locationStateInput = document.querySelector("#locationState");
const locationModalTitle = document.querySelector("#locationModalTitle");
const locationModal = new bootstrap.Modal(document.querySelector("#locationModal"));

// Página protegida
requireAuth((user) => {
    userInfo.textContent = `Usuário: ${user.email}`;
    loadLocations();
});
setupLogout(logoutButton);

function renderLocationsTable() {
    locationsTable.innerHTML = "";
    emptyMessage.classList.toggle("d-none", locations.length > 0);

    locations.forEach((location) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = location.name;

        const zipCodeCell = document.createElement("td");
        zipCodeCell.textContent = location.zipCode;

        const addressCell = document.createElement("td");
        const neighborhood = location.neighborhood ? ` - ${location.neighborhood}` : "";
        addressCell.textContent = `${location.street}, ${location.number}${neighborhood}`;

        const cityCell = document.createElement("td");
        cityCell.textContent = `${location.city}/${location.state}`;

        const actionCell = document.createElement("td");
        actionCell.className = "text-end text-nowrap";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-primary btn-sm me-2 admin-only";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openEditModal(location));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm admin-only";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => deleteLocation(location));

        actionCell.append(editButton, deleteButton);
        row.append(nameCell, zipCodeCell, addressCell, cityCell, actionCell);
        locationsTable.appendChild(row);
    });
}

async function loadLocations() {
    try {
        const response = await apiFetch(locationsUrl);
        if (!response.ok) {
            throw new Error("Não foi possível carregar os locais.");
        }
        const data = await response.json();
        locations.splice(0, locations.length, ...data);
        renderLocationsTable();
    } catch (error) {
        console.error("Error loading locations:", error);
        alert(error.message || "Não foi possível carregar os locais.");
    }
}

// Consulta ViaCEP
async function searchZipCode() {
    const zipCode = locationZipCodeInput.value.replace(/\D/g, "");

    if (zipCode.length !== 8) {
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
        if (!response.ok) {
            throw new Error("ViaCEP request failed");
        }

        const address = await response.json();

        if (address.erro) {
            console.warn("Zip code not found:", zipCode);
            alert("CEP não encontrado.");
            return;
        }

        locationStreetInput.value = address.logradouro;
        locationNeighborhoodInput.value = address.bairro;
        locationCityInput.value = address.localidade;
        locationStateInput.value = address.uf;
        locationNumberInput.focus();
        console.log("Address filled by ViaCEP:", address.logradouro);
    } catch (error) {
        console.error("Error searching zip code:", error);
        alert("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    }
}

function openCreateModal() {
    editingLocationId = null;
    locationModalTitle.textContent = "Novo Local";
    locationNameInput.value = "";
    locationZipCodeInput.value = "";
    locationStreetInput.value = "";
    locationNumberInput.value = "";
    locationComplementInput.value = "";
    locationNeighborhoodInput.value = "";
    locationCityInput.value = "";
    locationStateInput.value = "";
    locationModal.show();
}

function openEditModal(location) {
    editingLocationId = location.id;
    locationModalTitle.textContent = "Editar Local";
    locationNameInput.value = location.name;
    locationZipCodeInput.value = location.zipCode;
    locationStreetInput.value = location.street;
    locationNumberInput.value = location.number;
    locationComplementInput.value = location.complement ?? "";
    locationNeighborhoodInput.value = location.neighborhood ?? "";
    locationCityInput.value = location.city;
    locationStateInput.value = location.state;
    locationModal.show();
}

async function saveLocation() {
    const data = {
        name: locationNameInput.value.trim(),
        zipCode: locationZipCodeInput.value.trim(),
        street: locationStreetInput.value.trim(),
        number: locationNumberInput.value.trim(),
        complement: locationComplementInput.value.trim(),
        neighborhood: locationNeighborhoodInput.value.trim(),
        city: locationCityInput.value.trim(),
        state: locationStateInput.value.trim()
    };

    if (!data.name || !data.zipCode || !data.street || !data.number || !data.city || !data.state) {
        console.warn("Location required fields not filled");
        alert("Preencha nome, CEP, rua, número, cidade e UF.");
        return;
    }

    const isEditing = editingLocationId !== null;
    const url = isEditing ? `${locationsUrl}/${editingLocationId}` : locationsUrl;

    saveLocationButton.disabled = true;
    try {
        const response = await apiFetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível salvar o local.");
        }

        locationModal.hide();
        await loadLocations();
    } catch (error) {
        console.error("Error saving location:", error);
        alert(error.message || "Não foi possível salvar o local.");
    } finally {
        saveLocationButton.disabled = false;
    }
}

async function deleteLocation(location) {
    if (!confirm(`Excluir o local "${location.name}"?`)) {
        return;
    }

    try {
        const response = await apiFetch(`${locationsUrl}/${location.id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Não foi possível excluir o local.");
        }
        await loadLocations();
    } catch (error) {
        console.error("Error deleting location:", error);
        alert(error.message || "Não foi possível excluir o local.");
    }
}

newLocationButton.addEventListener("click", openCreateModal);
saveLocationButton.addEventListener("click", saveLocation);
// Ao sair do campo
locationZipCodeInput.addEventListener("blur", searchZipCode);

console.log("Locations page loaded");
