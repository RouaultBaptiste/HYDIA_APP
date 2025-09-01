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

// Tests pour les routes de mots de passe
const testPasswordRoutes = async () => {
  console.log('=== TESTS DES ROUTES API DE MOTS DE PASSE ===');
  console.log('=== TESTS DES ROUTES API DE MOTS DE PASSE ===');
  
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
  const categoryData = {
    name: `Test Category ${Date.now()}`,
    description: 'Catégorie créée pour les tests API'
  };
  
  const createCategoryResponse = await apiRequest(`/organizations/${organizationId}/password-categories`, 'POST', categoryData);
  
  if (createCategoryResponse.success && createCategoryResponse.data.category) {
    createdCategoryId = createCategoryResponse.data.category.id;
    console.log(`✅ Catégorie créée: ${createdCategoryId}`);
  } else {
    console.log('❌ Échec de la création de la catégorie:', createCategoryResponse.data);
  }

  // 3. Récupérer les catégories
  console.log('\n3. Récupération des catégories...');
  const categoriesResponse = await apiRequest(`/organizations/${organizationId}/password-categories`);
  
  if (categoriesResponse.success) {
    console.log(`✅ ${categoriesResponse.data.categories.length} catégories récupérées`);
  } else {
    console.log('❌ Échec de la récupération des catégories:', categoriesResponse.data);
  }

  // 4. Créer un mot de passe
  console.log('\n4. Création d\'un mot de passe...');
  const passwordData = {
    title: `Test Password ${Date.now()}`,
    username: 'testuser@example.com',
    password: 'SecurePassword123!',
    url: 'https://example.com',
    notes: 'Ceci est un mot de passe de test',
    categoryId: createdCategoryId
  };
  
  const createPasswordResponse = await apiRequest(`/organizations/${organizationId}/passwords`, 'POST', passwordData);
  
  if (createPasswordResponse.success && createPasswordResponse.data.password) {
    createdPasswordId = createPasswordResponse.data.password.id;
    console.log(`✅ Mot de passe créé: ${createdPasswordId}`);
  } else {
    console.log('❌ Échec de la création du mot de passe:', createPasswordResponse.data);
    return;
  }

  // 5. Récupérer tous les mots de passe
  console.log('\n5. Récupération de tous les mots de passe...');
  const passwordsResponse = await apiRequest(`/organizations/${organizationId}/passwords`);
  
  if (passwordsResponse.success) {
    console.log(`✅ ${passwordsResponse.data.passwords.length} mots de passe récupérés`);
  } else {
    console.log('❌ Échec de la récupération des mots de passe:', passwordsResponse.data);
  }

  // 6. Récupérer un mot de passe par ID
  console.log(`\n6. Récupération du mot de passe ${createdPasswordId}...`);
  const passwordResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}`);
  
  if (passwordResponse.success && passwordResponse.data.password) {
    console.log(`✅ Mot de passe récupéré: ${passwordResponse.data.password.title}`);
  } else {
    console.log('❌ Échec de la récupération du mot de passe:', passwordResponse.data);
  }

  // 7. Mettre à jour un mot de passe
  console.log(`\n7. Mise à jour du mot de passe ${createdPasswordId}...`);
  const updateData = {
    title: `Updated Password ${Date.now()}`,
    notes: 'Mot de passe mis à jour pour les tests'
  };
  
  const updateResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}`, 'PUT', updateData);
  
  if (updateResponse.success && updateResponse.data.password) {
    console.log(`✅ Mot de passe mis à jour: ${updateResponse.data.password.title}`);
  } else {
    console.log('❌ Échec de la mise à jour du mot de passe:', updateResponse.data);
  }

  // 8. Rechercher des mots de passe
  console.log('\n8. Recherche de mots de passe...');
  const searchTerm = 'Test';
  const searchResponse = await apiRequest(`/organizations/${organizationId}/passwords/search?search=${searchTerm}`);
  
  if (searchResponse.success) {
    console.log(`✅ ${searchResponse.data.passwords.length} résultats trouvés pour "${searchTerm}"`);
  } else {
    console.log('❌ Échec de la recherche:', searchResponse.data);
  }

  // 9. Générer un mot de passe
  console.log('\n9. Génération d\'un mot de passe...');
  const generateOptions = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  };
  
  const generateResponse = await apiRequest('/passwords/generate', 'POST', generateOptions);
  
  if (generateResponse.success && generateResponse.data.password) {
    console.log(`✅ Mot de passe généré: ${generateResponse.data.password.substring(0, 3)}...`);
  } else {
    console.log('❌ Échec de la génération du mot de passe:', generateResponse.data);
  }

  // 10. Analyser la force des mots de passe
  console.log('\n10. Analyse de la force des mots de passe...');
  const analysisResponse = await apiRequest(`/organizations/${organizationId}/passwords/strength-analysis`);
  
  if (analysisResponse.success && analysisResponse.data.analysis) {
    console.log(`✅ Analyse effectuée: ${analysisResponse.data.analysis.total} mots de passe analysés`);
  } else {
    console.log('❌ Échec de l\'analyse:', analysisResponse.data);
  }

  // 11. Exporter les mots de passe
  console.log('\n11. Export des mots de passe...');
  const exportResponse = await apiRequest(`/organizations/${organizationId}/passwords/export`);
  
  if (exportResponse.success && exportResponse.data.passwords) {
    console.log(`✅ ${exportResponse.data.passwords.length} mots de passe exportés`);
  } else {
    console.log('❌ Échec de l\'export:', exportResponse.data);
  }

  // 12. Supprimer un mot de passe
  console.log(`\n12. Suppression du mot de passe ${createdPasswordId}...`);
  const deleteResponse = await apiRequest(`/organizations/${organizationId}/passwords/${createdPasswordId}`, 'DELETE');
  
  if (deleteResponse.success) {
    console.log('✅ Mot de passe supprimé avec succès');
  } else {
    console.log('❌ Échec de la suppression du mot de passe:', deleteResponse.data);
  }

console.log('\n=== TESTS TERMINÉS ===');
};

// Exécuter les tests
console.log('Démarrage des tests de l\'API de mots de passe...');
testPasswordRoutes()
  .then(() => {
    console.log('Tests terminés avec succès');
  })
  .catch(err => {
    console.error('Erreur non gérée dans les tests:', err);
  });
