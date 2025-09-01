const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';
const COOKIES_FILE = './cookies_direct.txt';

// Utilisateur de test
const testUser = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me'
};

// Fonction principale
async function main() {
  try {
    // Authentification
    const authData = await authenticate();
    if (!authData) {
      console.log('❌ Échec de l\'authentification');
      return;
    }

    // Extraire les informations nécessaires
    const { userId, orgId, accessToken } = authData;
    
    // Tester les API avec les headers directs
    await testDirectApi(userId, orgId, accessToken);
    
    console.log('\n=== TESTS TERMINÉS ===');
  } catch (error) {
    console.error('Erreur globale:', error);
  }
}

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
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log('Erreur:', JSON.stringify(errorData, null, 2));
      return null;
    }
    
    const userData = await loginResponse.json();
    console.log('Réponse:', JSON.stringify(userData, null, 2));
    
    // Récupérer les cookies
    const cookies = loginResponse.headers.raw()['set-cookie'];
    console.log('Cookies reçus:', JSON.stringify(cookies, null, 2));
    
    // Sauvegarder les cookies
    saveCookies(cookies);
    
    // Extraire les valeurs des cookies
    const cookieValues = cookies.map(cookie => cookie.split(';')[0]);
    console.log('Valeurs des cookies:', JSON.stringify(cookieValues, null, 2));
    
    // Extraire le token d'accès
    const accessToken = cookieValues
      .find(c => c.startsWith('hydia_sess_access='))
      ?.split('=')[1];
      
    // Extraire l'ID utilisateur du token
    let userId = null;
    if (accessToken && accessToken.includes('antoine-user-id-456')) {
      userId = 'antoine-user-id-456';
    } else if (accessToken && accessToken.includes('test-user-id-123')) {
      userId = 'test-user-id-123';
    }
    
    // Extraire l'ID d'organisation
    const orgId = cookieValues
      .find(c => c.startsWith('hydia_sess_org='))
      ?.split('=')[1];
    
    if (userId && orgId && accessToken) {
      console.log(`✅ Authentification réussie - User ID: ${userId}, Org ID: ${orgId}`);
      return { userId, orgId, accessToken };
    } else {
      console.log('❌ Impossible d\'extraire les informations d\'authentification');
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return null;
  }
};

// Fonction pour tester les API directement avec les headers
const testDirectApi = async (userId, orgId, accessToken) => {
  console.log('\n=== TEST DES ROUTES API AVEC HEADERS DIRECTS ===');
  
  // Headers communs pour toutes les requêtes
  const headers = {
    'Content-Type': 'application/json',
    'Origin': FRONTEND_URL,
    'x-user-id': userId,
    'x-organization-id': orgId,
    'Authorization': `Bearer ${accessToken}`
  };
  
  // Test des mots de passe mock
  await testMockPasswordsApi(headers, orgId);
  
  // Test des notes mock
  await testMockNotesApi(headers, orgId);
};

// Fonction pour tester l'API des mots de passe mock
const testMockPasswordsApi = async (headers, orgId) => {
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
      headers,
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
      return;
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
      headers,
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
        headers
      });
      
      console.log(`Statut de la réponse: ${getPasswordResponse.status}`);
      const getPasswordResult = await getPasswordResponse.json();
      console.log('Réponse:', JSON.stringify(getPasswordResult, null, 2));
      
      if (getPasswordResponse.ok && getPasswordResult.data) {
        console.log(`✅ Mot de passe récupéré: ${passwordId}`);
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

// Fonction pour tester l'API des notes mock
const testMockNotesApi = async (headers, orgId) => {
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
      headers,
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
        headers
      });
      
      console.log(`Statut de la réponse: ${getNoteResponse.status}`);
      const getNoteResult = await getNoteResponse.json();
      console.log('Réponse:', JSON.stringify(getNoteResult, null, 2));
      
      if (getNoteResponse.ok && getNoteResult.data) {
        console.log(`✅ Note récupérée: ${noteId}`);
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

// Exécuter le script
main().catch(console.error);
