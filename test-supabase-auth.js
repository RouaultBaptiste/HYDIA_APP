const fetch = require('node-fetch');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';
const COOKIES_FILE = './cookies_supabase.txt';

// Utilisateur de test existant dans Supabase
const testUser = {
  email: 'antoineronold@proton.me',
  password: 'TestPassword123!' // Remplacer par le vrai mot de passe
};

// Fonction principale
async function main() {
  try {
    console.log('🔍 Test du nouveau système d\'authentification Supabase\n');
    
    // Test d'authentification
    const authData = await testAuthentication();
    if (!authData) {
      console.log('❌ Échec de l\'authentification');
      return;
    }

    // Test des routes API avec le nouveau système
    await testApiRoutes(authData.cookieHeader, authData.orgId);
    
    console.log('\n=== TESTS TERMINÉS ===');
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Fonction pour sauvegarder les cookies
const saveCookies = (cookies) => {
  fs.writeFileSync(COOKIES_FILE, cookies.join('\n'));
  console.log(`Cookies sauvegardés dans ${COOKIES_FILE}`);
};

// Test d'authentification avec le nouveau système
const testAuthentication = async () => {
  console.log('=== TEST D\'AUTHENTIFICATION SUPABASE ===');
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
      console.log('❌ Erreur:', JSON.stringify(errorData, null, 2));
      return null;
    }
    
    const userData = await loginResponse.json();
    console.log('✅ Réponse:', JSON.stringify(userData, null, 2));
    
    // Récupérer les cookies
    const cookies = loginResponse.headers.raw()['set-cookie'];
    if (cookies) {
      console.log('Cookies reçus:', JSON.stringify(cookies, null, 2));
      saveCookies(cookies);
      
      // Créer l'en-tête Cookie pour les requêtes suivantes
      const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
      
      // Extraire l'ID d'organisation
      let orgId = userData.data?.currentOrgId;
      if (!orgId && userData.data?.organizations?.length > 0) {
        orgId = userData.data.organizations[0].id;
      }
      
      if (orgId) {
        console.log(`✅ Authentification réussie - Organisation: ${orgId}`);
        return { cookieHeader, orgId };
      } else {
        console.log('❌ Aucune organisation trouvée');
        return null;
      }
    } else {
      console.log('❌ Aucun cookie reçu');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'authentification:', error);
    return null;
  }
};

// Test du profil utilisateur
const testUserProfile = async (cookieHeader) => {
  console.log('\n=== TEST DU PROFIL UTILISATEUR ===');
  
  try {
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
    
    if (profileResponse.ok && profileData.success) {
      console.log('✅ Profil utilisateur récupéré avec succès');
      return profileData.data;
    } else {
      console.log('❌ Échec de la récupération du profil');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    return null;
  }
};

// Test des organisations
const testOrganizations = async (cookieHeader) => {
  console.log('\n=== TEST DES ORGANISATIONS ===');
  
  try {
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
    
    if (orgsResponse.ok && orgsData.success) {
      console.log(`✅ ${orgsData.data?.organizations?.length || 0} organisations récupérées`);
      return orgsData.data?.organizations || [];
    } else {
      console.log('❌ Échec de la récupération des organisations');
      return [];
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des organisations:', error);
    return [];
  }
};

// Test des mots de passe
const testPasswords = async (cookieHeader, orgId) => {
  console.log('\n=== TEST DES MOTS DE PASSE ===');
  
  try {
    // Récupérer les mots de passe
    console.log('1. Récupération des mots de passe...');
    const passwordsResponse = await fetch(`${API_URL}/passwords`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL,
        'x-organization-id': orgId
      }
    });
    
    console.log(`Statut de la réponse: ${passwordsResponse.status}`);
    const passwordsData = await passwordsResponse.json();
    console.log('Réponse:', JSON.stringify(passwordsData, null, 2));
    
    if (passwordsResponse.ok && passwordsData.success) {
      console.log(`✅ ${passwordsData.data?.passwords?.length || 0} mots de passe récupérés`);
    } else {
      console.log('❌ Échec de la récupération des mots de passe');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des mots de passe:', error);
  }
};

// Test des notes
const testNotes = async (cookieHeader, orgId) => {
  console.log('\n=== TEST DES NOTES ===');
  
  try {
    // Récupérer les notes
    console.log('1. Récupération des notes...');
    const notesResponse = await fetch(`${API_URL}/notes`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Origin': FRONTEND_URL,
        'x-organization-id': orgId
      }
    });
    
    console.log(`Statut de la réponse: ${notesResponse.status}`);
    const notesData = await notesResponse.json();
    console.log('Réponse:', JSON.stringify(notesData, null, 2));
    
    if (notesResponse.ok && notesData.success) {
      console.log(`✅ ${notesData.data?.notes?.length || 0} notes récupérées`);
    } else {
      console.log('❌ Échec de la récupération des notes');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test des notes:', error);
  }
};

// Test des routes API avec le nouveau système
const testApiRoutes = async (cookieHeader, orgId) => {
  console.log('\n=== TEST DES ROUTES API ===');
  
  // Test du profil utilisateur
  await testUserProfile(cookieHeader);
  
  // Test des organisations
  await testOrganizations(cookieHeader);
  
  // Test des mots de passe
  await testPasswords(cookieHeader, orgId);
  
  // Test des notes
  await testNotes(cookieHeader, orgId);
};

// Exécuter le script
main().catch(console.error);
