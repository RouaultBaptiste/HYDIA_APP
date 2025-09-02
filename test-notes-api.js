// Test de l'API des notes avec authentification intégrée
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:8082';

// Utilisateur de test
const testUser = {
  email: 'Antoineronold@proton.me',
  password: 'Antoineronold@proton.me'
};

// Variable pour stocker les cookies de session
let sessionCookies = [];

// Variable pour stocker le token JWT extrait des cookies
let jwtToken = null;

// Fonction d'authentification pour obtenir les cookies
async function authenticate() {
  console.log('🔑 Authentification en cours...');
  
  try {
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
    
    // Récupérer les cookies de la réponse
    sessionCookies = loginResponse.headers.raw()['set-cookie'] || [];
    
    if (sessionCookies.length > 0) {
      console.log(`✅ Authentification réussie, ${sessionCookies.length} cookies reçus`);
      
      // Afficher les cookies pour débogage
      sessionCookies.forEach((cookie, index) => {
        console.log(`Cookie ${index + 1}:`, cookie);
      });
      
      // Extraire le token JWT du cookie d'accès
      const accessCookie = sessionCookies.find(cookie => cookie.startsWith('hydia_sess_access='));
      if (accessCookie) {
        jwtToken = accessCookie.split('=')[1].split(';')[0];
        console.log('Token JWT extrait:', jwtToken.substring(0, 20) + '...');
      }
      
      return true;
    } else {
      console.log('❌ Authentification échouée: aucun cookie reçu');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification:', error);
    return false;
  }
}

// Fonction utilitaire pour les requêtes API avec cookies d'authentification
async function apiRequest(endpoint, method = 'GET', body = null) {
  console.log(`📡 Envoi requête ${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL
    },
    credentials: 'include'
  };
  
  // Ne pas utiliser les cookies pour ce test, uniquement l'en-tête Authorization
  console.log('⚠️ Test sans cookies, uniquement avec l\'en-tête Authorization');
  // Commenté pour tester uniquement avec Authorization
  /*
  if (sessionCookies.length > 0) {
    // Extraire uniquement la partie nom=valeur de chaque cookie
    const simpleCookies = sessionCookies.map(cookie => {
      const cookiePart = cookie.split(';')[0].trim();
      return cookiePart;
    });
    
    options.headers['Cookie'] = simpleCookies.join('; ');
    console.log('🍪 Cookies utilisés pour l\'authentification');
    console.log('En-tête Cookie simplifié:', options.headers['Cookie']);
  }
  */
  
  // Ajouter l'en-tête Authorization avec le token JWT
  if (jwtToken) {
    options.headers['Authorization'] = `Bearer ${jwtToken}`;
    console.log('📝 En-tête Authorization ajouté avec le token JWT');
  }
  
  if (body) {
    options.body = JSON.stringify(body);
    console.log('Body:', JSON.stringify(body));
  }
  
  try {
    console.log(`URL complète: ${API_URL}${endpoint}`);
    console.log('En-têtes:', JSON.stringify(options.headers));
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`Status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Réponse:', JSON.stringify(data).substring(0, 200) + '...');
      return {
        status: response.status,
        data,
        success: response.ok
      };
    } else {
      const text = await response.text();
      console.log('Réponse (texte):', text.substring(0, 200) + '...');
      return {
        status: response.status,
        data: { text },
        success: response.ok
      };
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la requête ${method} ${endpoint}:`, error);
    return {
      status: 500,
      data: { error: error.message },
      success: false
    };
  }
}

// Tests pour les routes de notes
async function testNoteRoutes() {
  console.log('\n=== TESTS DES ROUTES API DE NOTES ===');
  
  let createdNoteId;
  let createdCategoryId;
  let organizationId;

  // 1. Récupérer l'ID de l'organisation
  console.log('\n1. Récupération des organisations...');
  const orgsResponse = await apiRequest('/organizations');
  
  if (orgsResponse.success && orgsResponse.data.organizations && orgsResponse.data.organizations.length > 0) {
    organizationId = orgsResponse.data.organizations[0].id;
    console.log(`✅ Organisation trouvée: ${organizationId}`);
  } else {
    console.log('❌ Aucune organisation trouvée');
    return;
  }

  // 2. Créer une catégorie de note
  console.log('\n2. Création d\'une catégorie de note...');
  const categoryData = {
    name: `Test Note Category ${Date.now()}`,
    description: 'Catégorie de notes créée pour les tests API'
  };
  
  const createCategoryResponse = await apiRequest(`/organizations/${organizationId}/note-categories`, 'POST', categoryData);
  
  if (createCategoryResponse.success && createCategoryResponse.data.category) {
    createdCategoryId = createCategoryResponse.data.category.id;
    console.log(`✅ Catégorie créée: ${createdCategoryId}`);
  } else {
    console.log('❌ Échec de la création de la catégorie:', createCategoryResponse.data);
  }

  // 3. Récupérer les catégories
  console.log('\n3. Récupération des catégories...');
  const categoriesResponse = await apiRequest(`/organizations/${organizationId}/note-categories`);
  
  if (categoriesResponse.success) {
    console.log(`✅ ${categoriesResponse.data.categories.length} catégories récupérées`);
  } else {
    console.log('❌ Échec de la récupération des catégories:', categoriesResponse.data);
  }

  // 4. Créer une note
  console.log('\n4. Création d\'une note...');
  const noteData = {
    title: `Test Note ${Date.now()}`,
    content: 'Ceci est une note de test créée via l\'API',
    tags: ['test', 'api', 'supabase'],
    isPublic: true,
    categoryId: createdCategoryId
  };
  
  const createNoteResponse = await apiRequest(`/organizations/${organizationId}/notes`, 'POST', noteData);
  
  if (createNoteResponse.success && createNoteResponse.data.note) {
    createdNoteId = createNoteResponse.data.note.id;
    console.log(`✅ Note créée: ${createdNoteId}`);
  } else {
    console.log('❌ Échec de la création de la note:', createNoteResponse.data);
    return;
  }

  // 5. Récupérer toutes les notes
  console.log('\n5. Récupération de toutes les notes...');
  const notesResponse = await apiRequest(`/organizations/${organizationId}/notes`);
  
  if (notesResponse.success) {
    console.log(`✅ ${notesResponse.data.notes.length} notes récupérées`);
  } else {
    console.log('❌ Échec de la récupération des notes:', notesResponse.data);
  }

  // 6. Récupérer une note par ID
  console.log(`\n6. Récupération de la note ${createdNoteId}...`);
  const noteResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}`);
  
  if (noteResponse.success && noteResponse.data.note) {
    console.log(`✅ Note récupérée: ${noteResponse.data.note.title}`);
  } else {
    console.log('❌ Échec de la récupération de la note:', noteResponse.data);
  }

  // 7. Mettre à jour une note
  console.log(`\n7. Mise à jour de la note ${createdNoteId}...`);
  const updateData = {
    title: `Updated Note ${Date.now()}`,
    content: 'Contenu mis à jour pour les tests',
    tags: ['test', 'api', 'updated']
  };
  
  const updateResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}`, 'PUT', updateData);
  
  if (updateResponse.success && updateResponse.data.note) {
    console.log(`✅ Note mise à jour: ${updateResponse.data.note.title}`);
  } else {
    console.log('❌ Échec de la mise à jour de la note:', updateResponse.data);
  }

  // 8. Rechercher des notes
  console.log('\n8. Recherche de notes...');
  const searchTerm = 'Test';
  const searchResponse = await apiRequest(`/organizations/${organizationId}/notes/search?search=${searchTerm}`);
  
  if (searchResponse.success) {
    console.log(`✅ ${searchResponse.data.notes.length} résultats trouvés pour "${searchTerm}"`);
  } else {
    console.log('❌ Échec de la recherche:', searchResponse.data);
  }

  // 9. Rechercher des notes par tags
  console.log('\n9. Recherche de notes par tags...');
  const tagSearchResponse = await apiRequest(`/organizations/${organizationId}/notes/by-tags?tags=test,api`);
  
  if (tagSearchResponse.success) {
    console.log(`✅ ${tagSearchResponse.data.notes.length} notes trouvées avec les tags spécifiés`);
  } else {
    console.log('❌ Échec de la recherche par tags:', tagSearchResponse.data);
  }

  // 10. Obtenir les statistiques des notes
  console.log('\n10. Récupération des statistiques des notes...');
  const statsResponse = await apiRequest(`/organizations/${organizationId}/notes/stats`);
  
  if (statsResponse.success && statsResponse.data.stats) {
    console.log(`✅ Statistiques récupérées: ${statsResponse.data.stats.totalNotes} notes au total`);
  } else {
    console.log('❌ Échec de la récupération des statistiques:', statsResponse.data);
  }

  // 11. Dupliquer une note
  console.log(`\n11. Duplication de la note ${createdNoteId}...`);
  const duplicateResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}/duplicate`, 'POST');
  
  if (duplicateResponse.success && duplicateResponse.data.note) {
    console.log(`✅ Note dupliquée: ${duplicateResponse.data.note.title}`);
    // Supprimer la note dupliquée pour nettoyer
    const duplicatedNoteId = duplicateResponse.data.note.id;
    await apiRequest(`/organizations/${organizationId}/notes/${duplicatedNoteId}`, 'DELETE');
  } else {
    console.log('❌ Échec de la duplication de la note:', duplicateResponse.data);
  }

  // 12. Exporter les notes
  console.log('\n12. Export des notes...');
  const exportResponse = await apiRequest(`/organizations/${organizationId}/notes/export`);
  
  if (exportResponse.success && exportResponse.data.notes) {
    console.log(`✅ ${exportResponse.data.notes.length} notes exportées`);
  } else {
    console.log('❌ Échec de l\'export:', exportResponse.data);
  }

  // 13. Supprimer une note
  console.log(`\n13. Suppression de la note ${createdNoteId}...`);
  const deleteResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}`, 'DELETE');
  
  if (deleteResponse.success) {
    console.log('✅ Note supprimée avec succès');
  } else {
    console.log('❌ Échec de la suppression de la note:', deleteResponse.data);
  }

  console.log('\n=== TESTS TERMINÉS ===');
};


// Fonction principale qui exécute l'authentification puis les tests
async function runTests() {
  console.log('=== TEST DE L\'API DES NOTES AVEC AUTHENTIFICATION INTÉGRÉE ===');
  
  // 1. Authentification pour obtenir les cookies
  const authSuccess = await authenticate();
  
  if (authSuccess) {
    console.log('\n✅ Authentification réussie, exécution des tests de notes...');
    await testNoteRoutes();
    console.log('\n=== TESTS TERMINÉS ===');
  } else {
    console.log('\n❌ Échec de l\'authentification, tests de notes annulés.');
  }
}

// Exécuter les tests
runTests().catch(error => {
  console.error('\n❌ Erreur lors de l\'exécution des tests:', error);
});
