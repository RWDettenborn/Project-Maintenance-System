import { requireAuth, setupLogout, apiFetch } from "./auth.js";
import { API_BASE_URL } from "./config.js";

const categoriesUrl = `${API_BASE_URL}/categories`;
const categories = [];
let editingCategoryId = null;

// DOM elements
const userInfo = document.querySelector("#userInfo");
const logoutButton = document.querySelector("#logoutButton");
const categoriesTable = document.querySelector("#categoriesTable");
const emptyMessage = document.querySelector("#emptyMessage");
const newCategoryButton = document.querySelector("#newCategoryButton");
const saveCategoryButton = document.querySelector("#saveCategoryButton");
const categoryNameInput = document.querySelector("#categoryName");
const categoryDescriptionInput = document.querySelector("#categoryDescription");
const categoryModalTitle = document.querySelector("#categoryModalTitle");
const categoryModal = new bootstrap.Modal(document.querySelector("#categoryModal"));

// Protected page: redirects to the login when there is no authenticated user
requireAuth((user) => {
    userInfo.textContent = `Usuário: ${user.email}`;
    loadCategories();
});
setupLogout(logoutButton);

function renderCategoriesTable() {
    categoriesTable.innerHTML = "";
    emptyMessage.classList.toggle("d-none", categories.length > 0);

    categories.forEach((category) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = category.name;

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = category.description ?? "-";

        const actionCell = document.createElement("td");
        actionCell.className = "text-end text-nowrap";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-primary btn-sm me-2 admin-only";
        editButton.textContent = "Editar";
        editButton.addEventListener("click", () => openEditModal(category));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger btn-sm admin-only";
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", () => deleteCategory(category));

        actionCell.append(editButton, deleteButton);
        row.append(nameCell, descriptionCell, actionCell);
        categoriesTable.appendChild(row);
    });
}

async function loadCategories() {
    try {
        const response = await apiFetch(categoriesUrl);
        if (!response.ok) {
            throw new Error("Não foi possível carregar as categorias.");
        }
        const data = await response.json();
        categories.splice(0, categories.length, ...data);
        renderCategoriesTable();
    } catch (error) {
        console.error("Error loading categories:", error);
        alert(error.message || "Não foi possível carregar as categorias.");
    }
}

function openCreateModal() {
    editingCategoryId = null;
    categoryModalTitle.textContent = "Nova Categoria";
    categoryNameInput.value = "";
    categoryDescriptionInput.value = "";
    categoryModal.show();
}

function openEditModal(category) {
    editingCategoryId = category.id;
    categoryModalTitle.textContent = "Editar Categoria";
    categoryNameInput.value = category.name;
    categoryDescriptionInput.value = category.description ?? "";
    categoryModal.show();
}

async function saveCategory() {
    const name = categoryNameInput.value.trim();
    const description = categoryDescriptionInput.value.trim();

    if (!name) {
        console.warn("Category name not provided");
        alert("Informe o nome da categoria.");
        return;
    }

    // Same form creates (POST) or edits (PUT): it depends on editingCategoryId
    const isEditing = editingCategoryId !== null;
    const url = isEditing ? `${categoriesUrl}/${editingCategoryId}` : categoriesUrl;

    saveCategoryButton.disabled = true;
    try {
        const response = await apiFetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || "Não foi possível salvar a categoria.");
        }

        categoryModal.hide();
        await loadCategories();
    } catch (error) {
        console.error("Error saving category:", error);
        alert(error.message || "Não foi possível salvar a categoria.");
    } finally {
        saveCategoryButton.disabled = false;
    }
}

async function deleteCategory(category) {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) {
        return;
    }

    try {
        const response = await apiFetch(`${categoriesUrl}/${category.id}`, { method: "DELETE" });
        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Não foi possível excluir a categoria.");
        }
        await loadCategories();
    } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.message || "Não foi possível excluir a categoria.");
    }
}

newCategoryButton.addEventListener("click", openCreateModal);
saveCategoryButton.addEventListener("click", saveCategory);

console.log("Categories page loaded");
