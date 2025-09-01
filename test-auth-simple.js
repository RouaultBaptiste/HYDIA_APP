// Script de test simple pour l'authentification
const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';

// Utilisateur de test
const testUser = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me'
};

// Fonction d'authentification
async function testAuth() {
  try {
    console.log('=== TEST D\'AUTHENTIFICATION ===');
    console.log(`Connexion avec l'utilisateur: ${testUser.email}`);
    
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`Statut de la réponse: ${loginResponse.status}`);
    
    // Récupérer les cookies
    const cookies = loginResponse.headers.raw()['set-cookie'];
    if (cookies) {
      console.log('Cookies reçus:', cookies);
      fs.writeFileSync('cookies_simple.txt', cookies.join('\n'));
      console.log('Cookies sauvegardés dans cookies_simple.txt');
    } else {
      console.log('Aucun cookie reçu');
    }
    
    const data = await loginResponse.json();
    console.log('Réponse:', JSON.stringify(data, null, 2));
    
    if (loginResponse.ok) {
      console.log('✅ Authentification réussie');
    } else {
      console.log('❌ Échec de l\'authentification');
    }
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

// Exécuter le test
testAuth();
