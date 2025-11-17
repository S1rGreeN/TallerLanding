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
 * Establece la calificación por estrellas.
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

/**
 * Carga y muestra las reseñas de Firebase para un taller.
 * @param {string} tallerId - El ID del taller (ej. "confecciones-elite")
 */
async function loadReviews(tallerId) {
  const reviewsContainer = document.getElementById("reviewsContainer");
  reviewsContainer.innerHTML = "<p>Cargando reseñas...</p>";
  
  const reviews = await getReviews(tallerId);
  reviewsContainer.innerHTML = ""; // Limpiar
  
  if (reviews.length === 0) {
    reviewsContainer.innerHTML = "<p>No hay reseñas para este taller aún. ¡Sé el primero!</p>";
  } else {
    reviews.forEach(review => {
      const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
      // Asegurarse de que createdAt sea un objeto Date
      const reviewDate = (review.createdAt.toDate ? review.createdAt.toDate() : new Date(review.createdAt)).toLocaleDateString();
      
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
    loadReviews(currentTallerId); // Recargar reseñas
  } else {
    alert('Hubo un error al guardar tu reseña.');
  }
  
  submitButton.disabled = false;
  submitButton.textContent = "Publicar Reseña";
}

// --- TODO SE CONECTA AQUÍ ---
// Este código se ejecuta una vez que el DOM está listo.
document.addEventListener('DOMContentLoaded', () => {

  // Botones de la Navbar
  document.getElementById('loginButton')?.addEventListener('click', () => openModal('loginModal'));
  document.getElementById('registerButton')?.addEventListener('click', () => openModal('registerModal'));
  document.getElementById('mobileMenuButton')?.addEventListener('click', toggleMobileMenu);

  // Botones para cerrar modales
  document.querySelectorAll('.close-modal-button').forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  // Clic en el fondo oscuro del modal para cerrar
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (event) => {
      // Si el clic fue en el fondo (el propio modal) y no en su contenido
      if (event.target === modal) {
        closeModal();
      }
    });
  });

  // Botones "Ver Detalles" de los talleres
  document.querySelectorAll('[data-taller-id]').forEach(button => {
    button.addEventListener('click', () => {
      currentTallerId = button.dataset.tallerId;
      const tallerName = button.dataset.tallerName;
      
      document.getElementById('tallerName').textContent = tallerName;
      openModal('tallerDetailModal');
      loadReviews(currentTallerId);
    });
  });

  // Estrellas de calificación
  document.querySelectorAll('.rating-star').forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating, 10);
      setRating(rating);
    });
  });

  // Formularios
  document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Manejar lógica de Login (aún no implementada)');
    closeModal();
  });
  
  document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Manejar lógica de Registro (aún no implementada)');
    closeModal();
  });

  document.getElementById('tallerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('¡Solicitud enviada! (aún no implementada)');
    e.target.reset();
  });

  document.getElementById('reviewForm')?.addEventListener('submit', handleReviewSubmit);

  // Smooth scroll para anclas (ej. #top-talleres)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Opcional: cerrar menú móvil si está abierto
        document.getElementById('mobileMenu').classList.add('hidden');
      }
    });
  });

});