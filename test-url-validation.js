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

// Fonction pour créer un mot de passe avec différentes valeurs d'URL
async function createPasswordWithURL(url, cookies) {
  console.log(`Test de création de mot de passe avec URL: "${url}"`);
  
  const passwordData = {
    title: `Test URL ${new Date().toISOString()}`,
    username: 'testuser',
    password: 'TestPassword123!',
    url: url,
    notes: 'Test de validation URL',
    categoryId: '',
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
      console.log(`✅ Succès avec URL "${url}":`, data);
      return { success: true, data };
    } else {
      console.log(`❌ Échec avec URL "${url}":`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error(`Erreur lors de la création du mot de passe avec URL "${url}":`, error);
    return { success: false, error };
  }
}

// Fonction principale pour exécuter les tests
async function runTests() {
  try {
    // Se connecter et récupérer les cookies
    const cookies = await login();
    
    // Tester différentes valeurs d'URL
    const urlsToTest = [
      'https://example.com',  // URL valide
      'example.com',          // URL sans protocole
      'anatomie',             // Chaîne simple (non-URL)
      '',                     // Chaîne vide
      null                    // Null
    ];
    
    // Exécuter les tests séquentiellement
    for (const url of urlsToTest) {
      await createPasswordWithURL(url, cookies);
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
