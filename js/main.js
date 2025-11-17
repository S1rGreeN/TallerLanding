// Importar las funciones de nuestro archivo firebase.js
import { saveReview, getReviews } from './firebase.js';

// Variables globales
let currentRating = 0;
let currentTallerId = null; // Para saber qué taller está abierto

// --- Funciones de Modal ---
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  document.body.style.overflow = 'auto';
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

// --- Sistema de Calificación ---
function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.rating-star');
  const ratingText = document.getElementById('ratingText');

  stars.forEach((star, index) => {
    star.style.color = (index < rating) ? '#f59e0b' : '#d1d5db';
  });

  const ratingTexts = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };
  ratingText.textContent = ratingTexts[rating] || 'Selecciona una calificación';
}

// --- Lógica de Firebase ---

// Función asincrónica para mostrar reseñas
async function loadReviews(tallerId) {
  const reviewsContainer = document.querySelector("#tallerDetailModal .space-y-4");
  reviewsContainer.innerHTML = "<p>Cargando reseñas...</p>";

  const reviews = await getReviews(tallerId);

  reviewsContainer.innerHTML = ""; // Limpiar

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = "<p>No hay reseñas para este taller aún. ¡Sé el primero!</p>";
  } else {
    reviews.forEach(review => {
      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      const reviewDate = review.createdAt.toDate().toLocaleDateString(); // Formatear fecha

      reviewsContainer.innerHTML += `
        <div class="bg-gray-50 p-5 rounded-xl">
          <div class="flex items-center mb-2">
            <div class="flex text-accent mr-2">
              <span class="text-xl">${stars}</span>
            </div>
            <span class="font-semibold text-dark">${review.author}</span>
            <span class="text-gray-500 text-sm ml-auto">${reviewDate}</span>
          </div>
          <p class="text-gray-700 font-body">${review.comment}</p>
        </div>
      `;
    });
  }
}

// Función para abrir el detalle del taller
function openTallerDetail(tallerId, tallerName) {
  currentTallerId = tallerId; // Guardar el ID del taller actual

  document.getElementById('tallerName').textContent = tallerName;
  openModal('tallerDetailModal');

  // Cargar las reseñas para este taller
  loadReviews(tallerId);
}

// Manejar el envío de la reseña
async function submitReview(event) {
  event.preventDefault();

  if (currentRating === 0) {
    alert('Por favor selecciona una calificación');
    return;
  }

  const comment = event.target.querySelector('textarea').value;
  const reviewData = {
    rating: currentRating,
    comment: comment || "Sin comentario."
  };

  // Deshabilitar el botón mientras se guarda
  const submitButton = event.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Publicando...";

  const success = await saveReview(currentTallerId, reviewData);

  if (success) {
    alert('¡Gracias por tu reseña!');
    event.target.reset();
    currentRating = 0;
    setRating(0);

    // Recargar las reseñas para mostrar la nueva
    loadReviews(currentTallerId);

  } else {
    alert('Hubo un error al guardar tu reseña.');
  }

  submitButton.disabled = false;
  submitButton.textContent = "Publicar Reseña";
}

// --- Exponer funciones al Window ---
// Como usamos módulos, debemos "exponer" manualmente las funciones
// que son llamadas por `onclick` en el HTML.
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleMobileMenu = toggleMobileMenu;
window.setRating = setRating;
window.submitReview = submitReview;

// Manejador de eventos para botones de "Ver Detalles"
// Esto es mejor que usar `onclick` en cada botón.

// 1. Dales a todos los botones de "Ver Detalles" un ID y nombre de taller.
// Ej: <button data-taller-id="confecciones-elite" data-taller-name="Confecciones Elite" ...>
// Tu HTML ya tiene: onclick="openTallerDetail(1)"
// Vamos a mejorarlo. Reemplaza los `onclick` en tu HTML:

// Taller 1:
// ANTES: onclick="openTallerDetail(1)"
// DESPUÉS: data-taller-id="confecciones-elite" data-taller-name="Confecciones Elite"

// Taller 2:
// ANTES: onclick="openTallerDetail(2)"
// DESPUÉS: data-taller-id="moda-express" data-taller-name="Moda Express"
// ...y así con todos

// 2. Añade esta lógica en su lugar:
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-taller-id]');
  if (button) {
    const tallerId = button.dataset.tallerId;
    const tallerName = button.dataset.tallerName;
    openTallerDetail(tallerId, tallerName);
  }
});

// Manejar el formulario de "Registra tu Taller"
function submitTallerForm(event) {
    event.preventDefault();
    alert('¡Solicitud enviada exitosamente! Nos pondremos en contacto contigo.');
    event.target.reset();
}
window.submitTallerForm = submitTallerForm; // Exponer

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}