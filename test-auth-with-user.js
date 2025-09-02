// Test d'authentification avec l'utilisateur de test
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// Utiliser l'utilisateur fourni par l'utilisateur
const testUser = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me',
  firstName: 'Antoine',
  lastName: 'Ronold'
};

// Configuration
const API_URL = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:8082';

async function testAuthentication() {
  console.log('🔍 Test d\'authentification avec l\'utilisateur de test...');
  console.log(`- Email: ${testUser.email}`);
  
  try {
    // Test de connexion
    console.log('\n📡 Test de connexion...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
      redirect: 'manual',
      credentials: 'include'
    });
    
    console.log(`Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log('Réponse:', JSON.stringify(loginData, null, 2));
    
    // Récupérer les cookies de la réponse
    const cookies = loginResponse.headers.raw()['set-cookie'];
    if (cookies) {
      console.log('Cookies reçus:', cookies);
      
      // Sauvegarder les cookies pour les requêtes suivantes
      fs.writeFileSync('cookies.txt', cookies.join('\n'));
      console.log('Cookies sauvegardés dans cookies.txt');
      
      // Test d'accès au profil avec les cookies
      console.log('\n📡 Test d\'accès au profil avec cookies...');
      const profileResponse = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Cookie': cookies.join('; '),
          'Origin': FRONTEND_URL
        },
        credentials: 'include'
      });
      
      console.log(`Status: ${profileResponse.status}`);
      const profileData = await profileResponse.json();
      console.log('Profil:', JSON.stringify(profileData, null, 2));
    } else {
      console.log('❌ Aucun cookie reçu dans la réponse');
    }
  } catch (err) {
    console.error('❌ Exception lors du test:', err);
  }
}

// Exécuter le test
testAuthentication();
