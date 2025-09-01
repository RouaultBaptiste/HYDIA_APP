// Script de test complet pour les API de mots de passe et de notes
const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';
const COOKIES_FILE = './cookies_test.txt';

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

// Fonction pour lire les cookies depuis un fichier
const getCookies = () => {
  try {
    const cookieFileContent = fs.readFileSync(COOKIES_FILE, 'utf8');
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
      'Origin': FRONTEND_URL,
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
    
    // Récupérer et sauvegarder les cookies s'ils sont présents
    const newCookies = response.headers.raw()['set-cookie'];
    if (newCookies) {
      console.log('Nouveaux cookies reçus');
      saveCookies(newCookies);
    }
    
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

// Fonction d'authentification
const authenticate = async () => {
  console.log('\n=== AUTHENTIFICATION ===');
  console.log(`Connexion avec l'utilisateur: ${testUser.email}`);
  
  const loginResponse = await apiRequest('/auth/login', 'POST', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (loginResponse.success) {
    console.log('✅ Authentification réussie');
    return true;
  } else {
    console.log('❌ Échec de l\'authentification:', loginResponse.data);
    return false;
  }
};

// Tests pour les routes de mots de passe
const testPasswordRoutes = async () => {
  console.log('\n=== TESTS DES ROUTES API DE MOTS DE PASSE ===');
  
  let createdPasswordId;
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

  // 2. Créer une catégorie de mot de passe
  console.log('\n2. Création d\'une catégorie de mot de passe...');
  const createCategoryResponse = await apiRequest(`/organizations/${organizationId}/password-categories`, 'POST', {
    name: 'Test Category',
    description: 'Catégorie de test pour les mots de passe',
    color: '#FF5733'
  });
  
  if (createCategoryResponse.success && createCategoryResponse.data.category) {
    createdCategoryId = createCategoryResponse.data.category.id;
    console.log(`✅ Catégorie créée avec l'ID: ${createdCategoryId}`);
  } else {
    console.log('❌ Échec de la création de la catégorie:', createCategoryResponse.data);
    // Continuer sans catégorie
  }

  // 3. Créer un mot de passe
  console.log('\n3. Création d\'un mot de passe...');
  const createPasswordResponse = await apiRequest(`/organizations/${organizationId}/passwords`, 'POST', {
    title: 'Test Password',
    username: 'testuser',
    password: 'P@ssw0rd123!',
    url: 'https://example.com',
    notes: 'Ceci est un mot de passe de test',
    categoryId: createdCategoryId || null
  });
  
  if (createPasswordResponse.success && createPasswordResponse.data.password) {
    createdPasswordId = createPasswordResponse.data.password.id;
    console.log(`✅ Mot de passe créé avec l'ID: ${createdPasswordId}`);
  } else {
    console.log('❌ Échec de la création du mot de passe:', createPasswordResponse.data);
    return;
  }

  // 4. Récupérer tous les mots de passe
  console.log('\n4. Récupération de tous les mots de passe...');
  const getAllResponse = await apiRequest(`/organizations/${organizationId}/passwords`);
  
  if (getAllResponse.success) {
    console.log(`✅ ${getAllResponse.data.passwords?.length || 0} mots de passe récupérés`);
  } else {
    console.log('❌ Échec de la récupération des mots de passe:', getAllResponse.data);
  }

  // 5. Récupérer un mot de passe spécifique
  console.log(`\n5. Récupération du mot de passe ${createdPasswordId}...`);
  const getOneResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}`);
  
  if (getOneResponse.success) {
    console.log('✅ Mot de passe récupéré avec succès');
  } else {
    console.log('❌ Échec de la récupération du mot de passe:', getOneResponse.data);
  }

  // 6. Mettre à jour un mot de passe
  console.log(`\n6. Mise à jour du mot de passe ${createdPasswordId}...`);
  const updateResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}`, 'PUT', {
    title: 'Test Password Updated',
    username: 'testuser_updated',
    password: 'NewP@ssw0rd456!',
    url: 'https://example-updated.com',
    notes: 'Ceci est un mot de passe de test mis à jour',
    categoryId: createdCategoryId || null
  });
  
  if (updateResponse.success) {
    console.log('✅ Mot de passe mis à jour avec succès');
  } else {
    console.log('❌ Échec de la mise à jour du mot de passe:', updateResponse.data);
  }

  // 7. Rechercher des mots de passe
  console.log('\n7. Recherche de mots de passe...');
  const searchResponse = await apiRequest(`/organizations/${organizationId}/passwords/search?q=updated`);
  
  if (searchResponse.success) {
    console.log(`✅ ${searchResponse.data.passwords?.length || 0} mots de passe trouvés`);
  } else {
    console.log('❌ Échec de la recherche de mots de passe:', searchResponse.data);
  }

  // 8. Exporter des mots de passe
  console.log('\n8. Export des mots de passe...');
  const exportResponse = await apiRequest(`/organizations/${organizationId}/passwords/export`);
  
  if (exportResponse.success) {
    console.log('✅ Mots de passe exportés avec succès');
  } else {
    console.log('❌ Échec de l\'export des mots de passe:', exportResponse.data);
  }

  // 9. Dupliquer un mot de passe
  console.log(`\n9. Duplication du mot de passe ${createdPasswordId}...`);
  const duplicateResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}/duplicate`, 'POST');
  
  let duplicatedPasswordId;
  if (duplicateResponse.success && duplicateResponse.data.password) {
    duplicatedPasswordId = duplicateResponse.data.password.id;
    console.log(`✅ Mot de passe dupliqué avec l'ID: ${duplicatedPasswordId}`);
  } else {
    console.log('❌ Échec de la duplication du mot de passe:', duplicateResponse.data);
  }

  // 10. Analyser la force d'un mot de passe
  console.log('\n10. Analyse de la force d\'un mot de passe...');
  const analyzeResponse = await apiRequest(`/organizations/${organizationId}/passwords/analyze`, 'POST', {
    password: 'P@ssw0rd123!'
  });
  
  if (analyzeResponse.success) {
    console.log('✅ Analyse de la force du mot de passe réussie');
  } else {
    console.log('❌ Échec de l\'analyse du mot de passe:', analyzeResponse.data);
  }

  // 11. Supprimer le mot de passe dupliqué si créé
  if (duplicatedPasswordId) {
    console.log(`\n11. Suppression du mot de passe dupliqué ${duplicatedPasswordId}...`);
    const deleteDuplicateResponse = await apiRequest(`/organizations/${organizationId}/passwords/${duplicatedPasswordId}`, 'DELETE');
    
    if (deleteDuplicateResponse.success) {
      console.log('✅ Mot de passe dupliqué supprimé avec succès');
    } else {
      console.log('❌ Échec de la suppression du mot de passe dupliqué:', deleteDuplicateResponse.data);
    }
  }

  // 12. Supprimer un mot de passe
  console.log(`\n12. Suppression du mot de passe ${createdPasswordId}...`);
  const deleteResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}`, 'DELETE');
  
  if (deleteResponse.success) {
    console.log('✅ Mot de passe supprimé avec succès');
  } else {
    console.log('❌ Échec de la suppression du mot de passe:', deleteResponse.data);
  }

  // 13. Supprimer la catégorie si créée
  if (createdCategoryId) {
    console.log(`\n13. Suppression de la catégorie ${createdCategoryId}...`);
    const deleteCategoryResponse = await apiRequest(`/organizations/${organizationId}/password-categories/${createdCategoryId}`, 'DELETE');
    
    if (deleteCategoryResponse.success) {
      console.log('✅ Catégorie supprimée avec succès');
    } else {
      console.log('❌ Échec de la suppression de la catégorie:', deleteCategoryResponse.data);
    }
  }

  console.log('\n=== TESTS DES MOTS DE PASSE TERMINÉS ===');
};

// Tests pour les routes de notes
const testNotesRoutes = async () => {
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
  const createCategoryResponse = await apiRequest(`/organizations/${organizationId}/note-categories`, 'POST', {
    name: 'Test Note Category',
    description: 'Catégorie de test pour les notes',
    color: '#3366FF'
  });
  
  if (createCategoryResponse.success && createCategoryResponse.data.category) {
    createdCategoryId = createCategoryResponse.data.category.id;
    console.log(`✅ Catégorie créée avec l'ID: ${createdCategoryId}`);
  } else {
    console.log('❌ Échec de la création de la catégorie:', createCategoryResponse.data);
    // Continuer sans catégorie
  }

  // 3. Créer une note
  console.log('\n3. Création d\'une note...');
  const createNoteResponse = await apiRequest(`/organizations/${organizationId}/notes`, 'POST', {
    title: 'Test Note',
    content: 'Ceci est une note de test',
    categoryId: createdCategoryId || null
  });
  
  if (createNoteResponse.success && createNoteResponse.data.note) {
    createdNoteId = createNoteResponse.data.note.id;
    console.log(`✅ Note créée avec l'ID: ${createdNoteId}`);
  } else {
    console.log('❌ Échec de la création de la note:', createNoteResponse.data);
    return;
  }

  // 4. Récupérer toutes les notes
  console.log('\n4. Récupération de toutes les notes...');
  const getAllResponse = await apiRequest(`/organizations/${organizationId}/notes`);
  
  if (getAllResponse.success) {
    console.log(`✅ ${getAllResponse.data.notes?.length || 0} notes récupérées`);
  } else {
    console.log('❌ Échec de la récupération des notes:', getAllResponse.data);
  }

  // 5. Récupérer une note spécifique
  console.log(`\n5. Récupération de la note ${createdNoteId}...`);
  const getOneResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}`);
  
  if (getOneResponse.success) {
    console.log('✅ Note récupérée avec succès');
  } else {
    console.log('❌ Échec de la récupération de la note:', getOneResponse.data);
  }

  // 6. Mettre à jour une note
  console.log(`\n6. Mise à jour de la note ${createdNoteId}...`);
  const updateResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}`, 'PUT', {
    title: 'Test Note Updated',
    content: 'Ceci est une note de test mise à jour',
    categoryId: createdCategoryId || null
  });
  
  if (updateResponse.success) {
    console.log('✅ Note mise à jour avec succès');
  } else {
    console.log('❌ Échec de la mise à jour de la note:', updateResponse.data);
  }

  // 7. Rechercher des notes
  console.log('\n7. Recherche de notes...');
  const searchResponse = await apiRequest(`/organizations/${organizationId}/notes/search?q=updated`);
  
  if (searchResponse.success) {
    console.log(`✅ ${searchResponse.data.notes?.length || 0} notes trouvées`);
  } else {
    console.log('❌ Échec de la recherche de notes:', searchResponse.data);
  }

  // 8. Exporter des notes
  console.log('\n8. Export des notes...');
  const exportResponse = await apiRequest(`/organizations/${organizationId}/notes/export`);
  
  if (exportResponse.success) {
    console.log('✅ Notes exportées avec succès');
  } else {
    console.log('❌ Échec de l\'export des notes:', exportResponse.data);
  }

  // 9. Dupliquer une note
  console.log(`\n9. Duplication de la note ${createdNoteId}...`);
  const duplicateResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}/duplicate`, 'POST');
  
  let duplicatedNoteId;
  if (duplicateResponse.success && duplicateResponse.data.note) {
    duplicatedNoteId = duplicateResponse.data.note.id;
    console.log(`✅ Note dupliquée avec l'ID: ${duplicatedNoteId}`);
  } else {
    console.log('❌ Échec de la duplication de la note:', duplicateResponse.data);
  }

  // 10. Supprimer la note dupliquée si créée
  if (duplicatedNoteId) {
    console.log(`\n10. Suppression de la note dupliquée ${duplicatedNoteId}...`);
    const deleteDuplicateResponse = await apiRequest(`/organizations/${organizationId}/notes/${duplicatedNoteId}`, 'DELETE');
    
    if (deleteDuplicateResponse.success) {
      console.log('✅ Note dupliquée supprimée avec succès');
    } else {
      console.log('❌ Échec de la suppression de la note dupliquée:', deleteDuplicateResponse.data);
    }
  }

  // 11. Supprimer une note
  console.log(`\n11. Suppression de la note ${createdNoteId}...`);
  const deleteResponse = await apiRequest(`/organizations/${organizationId}/notes/${createdNoteId}`, 'DELETE');
  
  if (deleteResponse.success) {
    console.log('✅ Note supprimée avec succès');
  } else {
    console.log('❌ Échec de la suppression de la note:', deleteResponse.data);
  }

  // 12. Supprimer la catégorie si créée
  if (createdCategoryId) {
    console.log(`\n12. Suppression de la catégorie ${createdCategoryId}...`);
    const deleteCategoryResponse = await apiRequest(`/organizations/${organizationId}/note-categories/${createdCategoryId}`, 'DELETE');
    
    if (deleteCategoryResponse.success) {
      console.log('✅ Catégorie supprimée avec succès');
    } else {
      console.log('❌ Échec de la suppression de la catégorie:', deleteCategoryResponse.data);
    }
  }

  console.log('\n=== TESTS DES NOTES TERMINÉS ===');
};

// Fonction principale pour exécuter tous les tests
const runAllTests = async () => {
  console.log('=== DÉMARRAGE DES TESTS API ===');
  console.log('Début des tests à:', new Date().toISOString());
  
  // Authentification
  const isAuthenticated = await authenticate();
  if (!isAuthenticated) {
    console.log('❌ Impossible de continuer les tests sans authentification');
    return;
  }
  
  // Tests des mots de passe
  await testPasswordRoutes();
  
  // Tests des notes
  await testNotesRoutes();
  
  console.log('\n=== TOUS LES TESTS SONT TERMINÉS ===');
};

// Exécuter tous les tests
runAllTests().catch(err => {
  console.error('Erreur non gérée dans les tests:', err);
});
