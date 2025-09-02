// Script simplifié pour tester la création de mot de passe
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:8082';
const USER_EMAIL = 'Antoineronold@proton.me';
const USER_PASSWORD = 'Antoineronold@proton.me';

// Fonction pour extraire les cookies d'une réponse
const extractCookies = (headers) => {
  const cookies = {};
  const cookieHeader = headers.get('set-cookie');
  
  if (!cookieHeader) {
    console.log('Aucun cookie trouvé dans les en-têtes');
    return cookies;
  }
  
  console.log('En-tête de cookie complet:', cookieHeader);
  
  cookieHeader.split(',').forEach(cookie => {
    const parts = cookie.split(';')[0].trim().split('=');
    if (parts.length === 2) {
      cookies[parts[0]] = parts[1];
    }
  });
  
  return cookies;
};

// Fonction pour se connecter
const login = async (email, password) => {
  console.log(`\n🔑 Tentative de connexion avec ${email}...`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    console.log(`Status: ${response.status}`);
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log('Réponse:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Réponse (texte):', responseText);
      data = {};
    }
    
    const cookies = extractCookies(response.headers);
    console.log('Cookies extraits:', cookies);
    
    return { cookies, data, success: response.ok };
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return { cookies: {}, data: {}, success: false };
  }
};

// Fonction pour créer un mot de passe
const createPassword = async (sessionCookies, passwordData) => {
  console.log(`\n🔒 Création d'un mot de passe avec categoryId=${JSON.stringify(passwordData.categoryId)}`);
  
  try {
    // Construire le cookie pour l'authentification
    const cookieHeader = Object.entries(sessionCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    
    console.log('En-tête de cookie utilisé:', cookieHeader);
    
    const response = await fetch(`${API_URL}/passwords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(passwordData),
      credentials: 'include'
    });
    
    console.log(`Status: ${response.status}`);
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
      console.log('Réponse:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Réponse (texte):', responseText);
      data = {};
    }
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('❌ Erreur:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction principale
const runTest = async () => {
  console.log('\n🚀 Démarrage du test de création de mot de passe');
  
  // Se connecter pour obtenir des cookies
  const loginResult = await login(USER_EMAIL, USER_PASSWORD);
  
  if (!loginResult.success) {
    console.error('\n❌ Échec de connexion, impossible de continuer les tests');
    return;
  }
  
  // Tester avec une chaîne vide pour categoryId
  await createPassword(loginResult.cookies, {
    title: `Test Password Empty ${new Date().toISOString()}`,
    username: 'testuser',
    password: 'TestPassword123!',
    url: '',
    notes: 'Test avec categoryId vide',
    categoryId: ''
  });
  
  // Tester avec null pour categoryId
  await createPassword(loginResult.cookies, {
    title: `Test Password Null ${new Date().toISOString()}`,
    username: 'testuser',
    password: 'TestPassword123!',
    url: '',
    notes: 'Test avec categoryId null',
    categoryId: null
  });
  
  // Tester avec un UUID valide pour categoryId
  await createPassword(loginResult.cookies, {
    title: `Test Password UUID ${new Date().toISOString()}`,
    username: 'testuser',
    password: 'TestPassword123!',
    url: '',
    notes: 'Test avec categoryId UUID valide',
    categoryId: '123e4567-e89b-12d3-a456-426614174000'
  });
  
  // Tester avec une chaîne non-UUID pour categoryId
  await createPassword(loginResult.cookies, {
    title: `Test Password Invalid ${new Date().toISOString()}`,
    username: 'testuser',
    password: 'TestPassword123!',
    url: '',
    notes: 'Test avec categoryId invalide',
    categoryId: 'not-a-uuid'
  });
  
  console.log('\n✅ Tests terminés');
};

// Exécuter le test
runTest().catch(error => {
  console.error('\n❌ Erreur non gérée:', error);
});
