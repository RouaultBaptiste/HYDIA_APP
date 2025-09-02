const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3001/api/v1';
const FRONTEND_ORIGIN = 'http://localhost:8082';

// Identifiants utilisateur
const userCredentials = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me'
};

// Fonction pour se connecter et récupérer les cookies
async function login() {
  console.log('Tentative de connexion...');
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_ORIGIN
    },
    body: JSON.stringify(userCredentials),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Erreur de connexion:', errorData);
    throw new Error(`Échec de la connexion: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('Connexion réussie:', data.success);
  
  // Récupérer les cookies de session
  const cookies = response.headers.get('set-cookie');
  console.log('Cookies de session:', cookies);
  
  return cookies;
}

// Fonction pour créer un mot de passe avec différentes valeurs de categoryId
async function createPasswordWithCategoryId(categoryId, cookies) {
  console.log(`Test de création de mot de passe avec categoryId: "${categoryId}"`);
  
  const passwordData = {
    title: `Test CategoryId ${new Date().toISOString()}`,
    username: 'testuser',
    password: 'TestPassword123!',
    url: 'https://example.com',
    notes: 'Test de validation categoryId',
    categoryId: categoryId,
    favorite: false,
    strength: 'strong',
    userId: '856e956c-ff96-44ea-803f-fb89c739c74b',
    organizationId: '11111111-2222-3333-4444-555555555555'
  };

  try {
    const response = await fetch(`${API_URL}/passwords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN,
        'Cookie': cookies
      },
      body: JSON.stringify(passwordData),
      credentials: 'include'
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Succès avec categoryId "${categoryId}":`, data);
      return { success: true, data };
    } else {
      console.log(`❌ Échec avec categoryId "${categoryId}":`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error(`Erreur lors de la création du mot de passe avec categoryId "${categoryId}":`, error);
    return { success: false, error };
  }
}

// Fonction principale pour exécuter les tests
async function runTests() {
  try {
    // Se connecter et récupérer les cookies
    const cookies = await login();
    
    // Tester différentes valeurs de categoryId
    const categoryIdsToTest = [
      '123e4567-e89b-12d3-a456-426614174000',  // UUID valide
      'personal',                              // Chaîne simple
      'work',                                  // Chaîne simple
      '',                                      // Chaîne vide
      null                                     // Null
    ];
    
    // Exécuter les tests séquentiellement
    for (const categoryId of categoryIdsToTest) {
      await createPasswordWithCategoryId(categoryId, cookies);
      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Tous les tests sont terminés!');
  } catch (error) {
    console.error('Erreur lors de l\'exécution des tests:', error);
  }
}

// Exécuter les tests
runTests();
