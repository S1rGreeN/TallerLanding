const fs = require('fs'); // 'fs' es el "File System" de Node.js

// Obtenemos las claves de las Variables de Entorno de Vercel
// process.env.NOMBRE_DE_LA_VARIABLE
const configContent = `
// Este archivo fue generado automáticamente por create-config.js

export const firebaseConfig = {
  apiKey: "${process.env.apiKey}",
  authDomain: "${process.env.authDomain}",
  projectId: "${process.env.projectId}",
  databaseURL: "${process.env.databaseURL},
  storageBucket: "${process.env.storageBucket}",
  messagingSenderId: "${process.env.messagingSenderId}",
  appId: "${process.env.appId}"
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