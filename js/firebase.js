// Importar funciones de Firebase desde el CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Importar nuestra configuración local (que está en .gitignore)
import { firebaseConfig } from "./firebaseConfig.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Guarda una nueva reseña en Firestore.
 * (Función flecha asincrónica)
 */
export const saveReview = async (tallerId, reviewData) => {
  try {
    const review = {
      tallerId: tallerId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      author: "Anónimo", // Votación anónima
      createdAt: new Date()
    };

    await addDoc(collection(db, "reviews"), review);
    return true;

  } catch (e) {
    console.error("Error al guardar la reseña: ", e);
    return false;
  }
};

/**
 * Obtiene todas las reseñas de un taller específico.
 * (Función flecha asincrónica)
 */
export const getReviews = async (tallerId) => {
  try {
    // Consultar reseñas que coincidan con el tallerId y ordenarlas por fecha
    const q = query(
      collection(db, "reviews"), 
      where("tallerId", "==", tallerId),
      orderBy("createdAt", "desc") // Mostrar las más nuevas primero
    );

    const querySnapshot = await getDocs(q);
    const reviews = [];

    querySnapshot.forEach((doc) => {
      reviews.push(doc.data());
    });

    return reviews;

  } catch (e) {
    console.error("Error al obtener reseñas: ", e);
    return [];
  }
};