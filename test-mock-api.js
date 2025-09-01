// Script de test pour les API mock
const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';
const COOKIES_FILE = './cookies_mock.txt';

// Utilisateur de test
const testUser = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me'
};

// Fonction pour extraire les cookies au format utilisable
const extractCookieValue = (cookieString) => {
  return cookieString.split(';')[0];
};

// Fonction pour sauvegarder les cookies
const saveCookies = (cookies) => {
  fs.writeFileSync(COOKIES_FILE, cookies.join('\n'));
  console.log(`Cookies sauvegardés dans ${COOKIES_FILE}`);
};

// Fonction d'authentification
const authenticate = async () => {
  console.log('\n=== AUTHENTIFICATION ===');
  console.log(`Connexion avec l'utilisateur: ${testUser.email}`);
  
  try {
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(testUser)
    });
    
    console.log(`Statut de la réponse: ${loginResponse.status}`);
    
    // Récupérer et sauvegarder les cookies
    const cookies = loginResponse.headers.raw()['set-cookie'];
    if (cookies) {
      console.log('Cookies reçus:', cookies);
      saveCookies(cookies);
      
      // Extraire les valeurs des cookies pour les utiliser dans les requêtes suivantes
      const cookieValues = cookies.map(extractCookieValue);
      console.log('Valeurs des cookies:', cookieValues);
      
      return cookieValues.join('; ');
    } else {
      console.log('Aucun cookie reçu');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return null;
  }
};

// Fonction pour tester les routes API
const testApiRoutes = async (cookieHeader) => {
  if (!cookieHeader) {
    console.log('❌ Impossible de tester les routes API sans cookies');
    return;
  }
  
  console.log('\n=== TEST DES ROUTES API ===');
  
  // Test de la route /auth/me pour récupérer les informations utilisateur
  try {
    console.log('\n1. Récupération du profil utilisateur...');
    const profileResponse = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL
      }
    });
    
    console.log(`Statut de la réponse: ${profileResponse.status}`);
    const profileData = await profileResponse.json();
    console.log('Réponse:', JSON.stringify(profileData, null, 2));
    
    if (profileResponse.ok && profileData.data && profileData.data.currentOrgId) {
      const orgId = profileData.data.currentOrgId;
      console.log(`✅ Organisation trouvée: ${orgId}`);
      
      // Test de la route /mock/passwords
      await testPasswordsApi(cookieHeader, orgId);
      
      // Test de la route /mock/notes
      await testNotesApi(cookieHeader, orgId);
    } else {
      console.log('❌ Aucune organisation trouvée');
    }
  } catch (error) {
    console.error('Erreur lors du test des organisations:', error);
  }
};

// Fonction pour tester l'API des mots de passe
const testPasswordsApi = async (cookieHeader, orgId) => {
  console.log('\n=== TEST DE L\'API DES MOTS DE PASSE MOCK ===');
  
  try {
    // Créer une catégorie
    console.log('\n1. Création d\'une catégorie...');
    const categoryData = {
      name: 'Test Category',
      color: '#FF5733',
      organizationId: orgId
    };
    
    const createCategoryResponse = await fetch(`${API_URL}/mock/passwords/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(categoryData)
    });
    
    console.log(`Statut de la réponse: ${createCategoryResponse.status}`);
    const categoryResult = await createCategoryResponse.json();
    console.log('Réponse:', JSON.stringify(categoryResult, null, 2));
    
    let categoryId = null;
    if (createCategoryResponse.ok && categoryResult.data) {
      categoryId = categoryResult.data.id;
      console.log(`✅ Catégorie créée: ${categoryId}`);
    } else {
      console.log('❌ Échec de la création de la catégorie');
    }
    
    // Créer un mot de passe
    console.log('\n2. Création d\'un mot de passe...');
    const passwordData = {
      title: 'Test Password',
      username: 'testuser',
      password: 'TestPassword123!',
      url: 'https://example.com',
      notes: 'Test notes',
      categoryId: categoryId,
      organizationId: orgId
    };
    
    const createPasswordResponse = await fetch(`${API_URL}/mock/passwords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(passwordData)
    });
    
    console.log(`Statut de la réponse: ${createPasswordResponse.status}`);
    const passwordResult = await createPasswordResponse.json();
    console.log('Réponse:', JSON.stringify(passwordResult, null, 2));
    
    let passwordId = null;
    if (createPasswordResponse.ok && passwordResult.data) {
      passwordId = passwordResult.data.id;
      console.log(`✅ Mot de passe créé: ${passwordId}`);
      
      // Récupérer le mot de passe
      console.log('\n3. Récupération du mot de passe...');
      const getPasswordResponse = await fetch(`${API_URL}/mock/passwords/${passwordId}`, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Origin': FRONTEND_URL
        }
      });
      
      console.log(`Statut de la réponse: ${getPasswordResponse.status}`);
      const getPasswordResult = await getPasswordResponse.json();
      console.log('Réponse:', JSON.stringify(getPasswordResult, null, 2));
      
      if (getPasswordResponse.ok && getPasswordResult.data) {
        console.log('✅ Mot de passe récupéré avec succès');
      } else {
        console.log('❌ Échec de la récupération du mot de passe');
      }
    } else {
      console.log('❌ Échec de la création du mot de passe');
    }
  } catch (error) {
    console.error('Erreur lors du test de l\'API des mots de passe:', error);
  }
};

// Fonction pour tester l'API des notes
const testNotesApi = async (cookieHeader, orgId) => {
  console.log('\n=== TEST DE L\'API DES NOTES MOCK ===');
  
  try {
    // Créer une note
    console.log('\n1. Création d\'une note...');
    const noteData = {
      title: 'Test Note',
      content: 'This is a test note content',
      organizationId: orgId
    };
    
    const createNoteResponse = await fetch(`${API_URL}/mock/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(noteData)
    });
    
    console.log(`Statut de la réponse: ${createNoteResponse.status}`);
    const noteResult = await createNoteResponse.json();
    console.log('Réponse:', JSON.stringify(noteResult, null, 2));
    
    let noteId = null;
    if (createNoteResponse.ok && noteResult.data) {
      noteId = noteResult.data.id;
      console.log(`✅ Note créée: ${noteId}`);
      
      // Récupérer la note
      console.log('\n2. Récupération de la note...');
      const getNoteResponse = await fetch(`${API_URL}/mock/notes/${noteId}`, {
        method: 'GET',
        headers: {
          'Cookie': cookieHeader,
          'Origin': FRONTEND_URL
        }
      });
      
      console.log(`Statut de la réponse: ${getNoteResponse.status}`);
      const getNoteResult = await getNoteResponse.json();
      console.log('Réponse:', JSON.stringify(getNoteResult, null, 2));
      
      if (getNoteResponse.ok && getNoteResult.data) {
        console.log('✅ Note récupérée avec succès');
      } else {
        console.log('❌ Échec de la récupération de la note');
      }
    } else {
      console.log('❌ Échec de la création de la note');
    }
  } catch (error) {
    console.error('Erreur lors du test de l\'API des notes:', error);
  }
};

// Fonction principale
const runTests = async () => {
  // Authentification
  const cookieHeader = await authenticate();
  
  // Test des routes API
  await testApiRoutes(cookieHeader);
  
  console.log('\n=== TESTS TERMINÉS ===');
};

// Exécuter les tests
runTests();
