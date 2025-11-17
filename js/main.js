// Importar las funciones de nuestro archivo firebase.js
import { saveReview, getReviews } from './firebase.js';

// Variables globales
let currentRating = 0;
let currentTallerId = null;

/**
 * Abre un modal por su ID.
 * @param {string} modalId - El ID del modal a abrir (ej. "loginModal")
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Cierra todos los modales activos.
 */
function closeModal() {
  document.querySelectorAll('.modal.active').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = 'auto';
}

/**
 * Muestra/oculta el menú móvil.
 */
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
}

/**
 * Establece la calificación por estrellas en el modal.
 * @param {number} rating - El número de estrellas (1-5)
 */
function setRating(rating) {
  currentRating = rating;
  const stars = document.querySelectorAll('.rating-star');
  const ratingText = document.getElementById('ratingText');
  
  stars.forEach(star => {
    const starRating = parseInt(star.dataset.rating, 10);
    star.style.color = (starRating <= rating) ? '#f59e0b' : '#d1d5db';
  });

  const ratingTexts = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };
  ratingText.textContent = ratingTexts[rating] || 'Selecciona una calificación';
}

// --- NUEVAS FUNCIONES DE CALIFICACIÓN ---

/**
 * Toma un array de reseñas y calcula el promedio y el conteo.
 * @param {Array} reviews - Array de objetos de reseña
 * @returns {Object} - { average: 4.5, count: 120 }
 */
function calculateRatingStats(reviews) {
  if (!reviews || reviews.length === 0) {
    return { average: 0, count: 0 };
  }

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = totalRating / reviews.length;
  
  return {
    average: parseFloat(average.toFixed(1)), // Redondear a 1 decimal
    count: reviews.length
  };
}

/**
 * Genera el HTML de las estrellas basado en un promedio.
 * @param {number} averageRating - El promedio (ej. 4.2)
 * @returns {string} - HTML de estrellas (ej. "★★★★☆")
 */
function getStarsHTML(averageRating) {
  const rounded = Math.round(averageRating); // Redondear al entero más cercano
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

/**
 * Actualiza la UI de calificación (estrellas y texto) en las TARJETAS de la página principal.
 * @param {string} tallerId - El ID del taller (ej. "confecciones-elite")
 * @param {Object} stats - El objeto de estadísticas { average, count }
 */
function renderCardRating(tallerId, stats) {
  const starsEl = document.getElementById(`stars-${tallerId}`);
  const ratingEl = document.getElementById(`rating-${tallerId}`);

  if (starsEl) {
    starsEl.innerHTML = (stats.count > 0) ? getStarsHTML(stats.average) : '<span class="text-gray-300">★★★★★</span>';
    if (stats.count > 0) starsEl.classList.remove('text-gray-300');
  }
  
  if (ratingEl) {
    // Formato diferente para tarjetas top vs nuevas
    if (tallerId.startsWith('confecciones') || tallerId.startsWith('moda') || tallerId.startsWith('textiles')) {
      ratingEl.textContent = (stats.count > 0) ? `${stats.average} (${stats.count} reseñas)` : '(0 reseñas)';
    } else {
      ratingEl.textContent = (stats.count > 0) ? `${stats.average} (${stats.count})` : '(0)';
    }
  }
}

/**
 * Actualiza la UI de calificación (estrellas y texto) DENTRO DEL MODAL.
 * @param {Object} stats - El objeto de estadísticas { average, count }
 */
function renderModalRating(stats) {
  const starsEl = document.getElementById('modal-stars');
  const ratingEl = document.getElementById('modal-rating');

  if (starsEl) {
    starsEl.innerHTML = (stats.count > 0) ? getStarsHTML(stats.average) : '<span class="text-gray-300">★★★★★</span>';
    if (stats.count > 0) starsEl.classList.remove('text-gray-300');
  }
  
  if (ratingEl) {
    ratingEl.textContent = (stats.count > 0) ? `${stats.average} de 5 (${stats.count} reseñas)` : 'Aún no hay reseñas';
  }
}

/**
 * Carga y muestra las reseñas de Firebase para un taller.
 * Esta función ahora actualiza TODO: el modal y la lista de reseñas.
 * @param {string} tallerId - El ID del taller (ej. "confecciones-elite")
 */
async function loadReviews(tallerId) {
  const reviewsContainer = document.getElementById("reviewsContainer");
  reviewsContainer.innerHTML = "<p>Cargando reseñas...</p>";
  
  // 1. Obtener reseñas
  const reviews = await getReviews(tallerId);
  
  // 2. Calcular estadísticas
  const stats = calculateRatingStats(reviews);

  // 3. Actualizar el rating del modal
  renderModalRating(stats);

  // 4. Renderizar la lista de reseñas
  reviewsContainer.innerHTML = ""; // Limpiar "cargando"
  
  if (reviews.length === 0) {
    reviewsContainer.innerHTML = "<p>No hay reseñas para este taller aún. ¡Sé el primero!</p>";
  } else {
    reviews.forEach(review => {
      const stars = getStarsHTML(review.rating);
      const reviewDate = (review.createdAt?.toDate ? review.createdAt.toDate() : new Date()).toLocaleDateString();
      
      reviewsContainer.innerHTML += `
        <div class="bg-gray-50 p-5 rounded-xl">
          <div class="flex items-center mb-2">
            <div class="flex text-accent mr-2"><span class="text-xl">${stars}</span></div>
            <span class="font-semibold text-dark">${review.author}</span>
            <span class="text-gray-500 text-sm ml-auto">${reviewDate}</span>
          </div>
          <p class="text-gray-700 font-body">${review.comment}</p>
        </div>
      `;
    });
  }
}

/**
 * Función separada para cargar solo las calificaciones de las tarjetas.
 * Se llama al cargar la página.
 * @param {string} tallerId
 */
async function updateCardRating(tallerId) {
  const reviews = await getReviews(tallerId);
  const stats = calculateRatingStats(reviews);
  renderCardRating(tallerId, stats);
}


/**
 * Maneja el envío del formulario de reseña.
 * @param {Event} event - El evento de envío del formulario
 */
async function handleReviewSubmit(event) {
  event.preventDefault(); // Evitar que la página se recargue
  
  if (currentRating === 0) {
    alert('Por favor selecciona una calificación');
    return;
  }
  
  const form = event.target;
  const comment = form.querySelector('textarea').value;
  const submitButton = form.querySelector('button[type="submit"]');

  const reviewData = {
    rating: currentRating,
    comment: comment || "Sin comentario."
  };

  submitButton.disabled = true;
  submitButton.textContent = "Publicando...";

  const success = await saveReview(currentTallerId, reviewData);

  if (success) {
    alert('¡Gracias por tu reseña!');
    form.reset();
    setRating(0); // Reiniciar estrellas
    
    // --- [CAMBIO CLAVE] ---
    // Recargar las reseñas en el modal (esto también actualiza el rating del modal)
    loadReviews(currentTallerId);
    // Actualizar la calificación en la tarjeta de la página principal
    updateCardRating(currentTallerId); 
    
  } else {
    alert('Hubo un error al guardar tu reseña.');
  }
  
  submitButton.disabled = false;
  submitButton.textContent = "Publicar Reseña";
}

// --- TODO SE CONECTA AQUÍ ---
document.addEventListener('DOMContentLoaded', () => {

  // ... (Event Listeners para botones de modal, etc.) ...

  // Botones "Ver Detalles" de los talleres
  document.querySelectorAll('[data-taller-id]').forEach(button => {
    button.addEventListener('click', () => {
      currentTallerId = button.dataset.tallerId;
      const tallerName = button.dataset.tallerName;
      
      document.getElementById('tallerName').textContent = tallerName;
      setRating(0); // Reiniciar estrellas al abrir
      openModal('tallerDetailModal');
      loadReviews(currentTallerId); // Carga las reseñas y el rating del modal
    });
  });

  // ... (Event Listeners para estrellas y formularios) ...

  // --- [NUEVO] Cargar todas las calificaciones de las tarjetas al iniciar ---
  function loadAllWorkshopRatings() {
    document.querySelectorAll('[data-taller-id]').forEach(button => {
      updateCardRating(button.dataset.tallerId);
    });
  }
  
  loadAllWorkshopRatings(); // ¡Ejecutar al cargar la página!

});