// Script de test pour l'authentification
const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';
const COOKIES_FILE = './cookies_debug.txt';

// Utilisateur de test
const testUser = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me'
};

// Fonction pour écrire les cookies dans un fichier
const saveCookies = (cookies) => {
  fs.writeFileSync(COOKIES_FILE, cookies.join('\n'));
  console.log(`Cookies sauvegardés dans ${COOKIES_FILE}`);
};

// Fonction d'authentification
const authenticate = async () => {
  console.log('\n=== AUTHENTIFICATION ===');
  console.log(`Connexion avec l'utilisateur: ${testUser.email}`);
  
  try {
    console.log(`URL complète: ${API_URL}/auth/login`);
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    console.log(`Statut de la réponse: ${loginResponse.status}`);
    
    // Récupérer et sauvegarder les cookies s'ils sont présents
    const newCookies = loginResponse.headers.raw()['set-cookie'];
    if (newCookies) {
      console.log('Cookies reçus:', newCookies);
      saveCookies(newCookies);
    } else {
      console.log('Aucun cookie reçu');
    }
    
    const data = await loginResponse.json();
    console.log('Réponse:', JSON.stringify(data, null, 2));
    
    if (loginResponse.ok) {
      console.log('✅ Authentification réussie');
      
      // Tester une requête avec les cookies
      console.log('\n=== TEST DE REQUÊTE AVEC COOKIES ===');
      
      // Lire les cookies sauvegardés
      const cookies = fs.readFileSync(COOKIES_FILE, 'utf8').split('\n');
      const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
      
      console.log('En-tête Cookie:', cookieHeader);
      
      // Faire une requête pour récupérer les organisations
      console.log('Envoi requête GET /organizations');
      const orgsResponse = await fetch(`${API_URL}/organizations`, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Origin': FRONTEND_URL
        }
      });
      
      console.log(`Statut de la réponse: ${orgsResponse.status}`);
      const orgsData = await orgsResponse.json();
      console.log('Réponse:', JSON.stringify(orgsData, null, 2));
      
      return true;
    } else {
      console.log('❌ Échec de l\'authentification');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return false;
  }
};

// Exécuter le test d'authentification
authenticate().then(() => {
  console.log('\n=== TEST TERMINÉ ===');
}).catch(err => {
  console.error('Erreur non gérée:', err);
});
