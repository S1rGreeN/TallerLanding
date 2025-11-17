// Importar funciones de Firebase desde el CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Importar funciones de Firebase desde el CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Importar nuestra configuración local
import { firebaseConfig } from "./firebaseConfig.js";

// --- INICIALIZACIÓN DE FIREBASE ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- [LA LÍNEA QUE FALTA] ---
// Esta es la línea que probablemente faltaba en tu archivo.
// Define la variable 'reviewsCollection' como una referencia a la colección "reviews".
const reviewsCollection = collection(db, "reviews");

/**
 * Guarda una nueva reseña en Firestore.
 */
export const saveReview = async (tallerId, reviewData) => {
  try {
    const review = {
      tallerId: tallerId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      author: "Anónimo",
      createdAt: serverTimestamp()
    };
    
    // Ahora 'reviewsCollection' SÍ está definida y esta línea funcionará.
    await addDoc(reviewsCollection, review);
    return true;
    
  } catch (e) {
    console.error("Error al guardar la reseña (Firebase): ", e); // Log más detallado
    return false;
  }
};

/**
 * Obtiene todas las reseñas de un taller específico.
 */
export const getReviews = async (tallerId) => {
  try {
    // Ahora 'reviewsCollection' SÍ está definida y esta línea funcionará.
    const q = query(
      reviewsCollection, 
      where("tallerId", "==", tallerId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const reviews = [];
    
    querySnapshot.forEach((doc) => {
      reviews.push(doc.data());
    });
    
    return reviews;
    
  } catch (e) {
    console.error("Error al obtener reseñas (Firebase): ", e); // Log más detallado
    return [];
  }
};