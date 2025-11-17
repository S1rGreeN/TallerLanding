
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

import { firebaseConfig } from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const reviewsCollection = collection(db, "reviews");

export const saveReview = async (tallerId, reviewData) => {
  try {
    const review = {
      tallerId: tallerId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      author: "Anónimo",
      createdAt: serverTimestamp()
    };
    await addDoc(reviewsCollection, review);
    return true;
    
  } catch (e) {
    console.error("Error al guardar la reseña (Firebase): ", e); 
    return false;
  }
};

export const getReviews = async (tallerId) => {
  try {
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
    console.error("Error al obtener reseñas (Firebase): ", e); 
    return [];
  }
};