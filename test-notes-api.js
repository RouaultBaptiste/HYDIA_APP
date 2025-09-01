const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const COOKIES_FILE = './cookies.txt';

// Lire les cookies d'authentification
const getCookies = () => {
  try {
    const cookieFileContent = fs.readFileSync(COOKIES_FILE, 'utf8');
    // Le fichier contient déjà les cookies au format correct
    // Chaque ligne est un cookie complet
    const cookieLines = cookieFileContent.split('\n').filter(line => line.trim() !== '');
    
    // Extraire juste la partie nom=valeur de chaque cookie
    const cookies = cookieLines.map(line => {
      const cookiePart = line.split(';')[0].trim();
      return cookiePart;
    });
    
    return cookies.join('; ');
  } catch (error) {
    console.error('Erreur lors de la lecture des cookies:', error);
    return '';
  }
};

// Fonction utilitaire pour les requêtes API
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const cookies = getCookies();
  
  console.log(`Envoi requête ${method} ${endpoint}`);
  console.log('Cookies utilisés:', cookies);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
    console.log('Body:', JSON.stringify(body, null, 2));
  }

  try {
    console.log(`URL complète: ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, options);
    console.log(`Statut de la réponse: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Réponse:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      
      return {
        status: response.status,
        data,
        success: response.ok
      };
    } else {
      const text = await response.text();
      console.log('Réponse (texte):', text.substring(0, 500) + '...');
      
      return {
        status: response.status,
        data: { text },
        success: response.ok
      };
    }
  } catch (error) {
    console.error(`Erreur lors de la requête ${method} ${endpoint}:`, error);
    return {
      status: 500,
      data: { error: error.message },
      success: false
    };
  }
};

// Tests pour les routes de notes
const testNoteRoutes = async () => {
  console.log('=== TESTS DES ROUTES API DE NOTES ===');
  
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

// Exécuter les tests
testNoteRoutes().catch(error => {
  console.error('Erreur lors de l\'exécution des tests:', error);
});
