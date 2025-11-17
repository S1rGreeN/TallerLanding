const fs = require('fs'); // 'fs' es el "File System" de Node.js

// Obtenemos las claves de las Variables de Entorno de Vercel
// process.env.NOMBRE_DE_LA_VARIABLE
const configContent = `
// Este archivo fue generado automáticamente por create-config.js

export const firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
  projectId: "${process.env.FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.FIREBASE_APP_ID}"
};
`;

// Escribimos el contenido en el archivo que usará nuestra app
try {
  fs.writeFileSync('js/firebaseConfig.js', configContent);
  console.log('firebaseConfig.js creado exitosamente.');
} catch (error) {
  console.error('Error al escribir firebaseConfig.js:', error);
  process.exit(1); // Detiene el build si falla
}