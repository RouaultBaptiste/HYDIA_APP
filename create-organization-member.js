// Script pour créer le membership d'organisation via l'API backend
const fetch = require('node-fetch');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api/v1';
const COOKIES_FILE = './cookies_enhanced_test.txt';

// Fonction pour lire les cookies
const getCookies = () => {
  try {
    const cookieFileContent = fs.readFileSync(COOKIES_FILE, 'utf8');
    const cookieLines = cookieFileContent.split('\n').filter(line => line.trim() !== '');
    const cookies = cookieLines.map(line => line.split(';')[0].trim());
    return cookies.join('; ');
  } catch (error) {
    console.log('Aucun cookie trouvé');
    return '';
  }
};

// Fonction pour faire une requête API
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const cookies = getCookies();
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:8082',
    }
  };

  if (cookies) {
    options.headers['Cookie'] = cookies;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 500,
      data: { error: error.message },
      success: false
    };
  }
};

async function createOrganizationMember() {
  console.log('=== CRÉATION DU MEMBERSHIP D\'ORGANISATION ===');
  
  try {
    // 1. Vérifier l'authentification
    console.log('\n1. Vérification de l\'authentification...');
    const authResponse = await apiRequest('/auth/me');
    
    if (!authResponse.success) {
      console.log('❌ Non authentifié, connexion nécessaire...');
      
      const loginResponse = await apiRequest('/auth/login', 'POST', {
        email: 'Antoineronold@proton.me',
        password: 'Antoineronold@proton.me'
      });
      
      if (!loginResponse.success) {
        console.error('❌ Échec de la connexion:', loginResponse.data);
        return;
      }
      
      console.log('✅ Connexion réussie');
    } else {
      console.log('✅ Déjà authentifié');
    }
    
    // 2. Récupérer les organisations existantes
    console.log('\n2. Récupération des organisations...');
    const orgsResponse = await apiRequest('/organizations');
    
    if (!orgsResponse.success) {
      console.error('❌ Impossible de récupérer les organisations:', orgsResponse.data);
      return;
    }
    
    const organizations = orgsResponse.data.data?.organizations || [];
    console.log(`✅ ${organizations.length} organisation(s) trouvée(s)`);
    
    const targetOrg = organizations.find(org => org.id === '11111111-2222-3333-4444-555555555555');
    
    if (!targetOrg) {
      console.log('❌ Organisation cible non trouvée, création d\'une nouvelle organisation...');
      
      // 3. Créer une nouvelle organisation
      const createOrgResponse = await apiRequest('/organizations', 'POST', {
        name: 'Organisation Admin Hydia',
        description: 'Organisation de test pour l\'administrateur'
      });
      
      if (!createOrgResponse.success) {
        console.error('❌ Échec de la création de l\'organisation:', createOrgResponse.data);
        return;
      }
      
      console.log('✅ Organisation créée:', createOrgResponse.data.data?.organization?.name);
    } else {
      console.log('✅ Organisation trouvée:', targetOrg.name);
    }
    
    // 4. Tester l'accès aux mots de passe
    console.log('\n4. Test d\'accès aux mots de passe...');
    const passwordsResponse = await apiRequest('/passwords', 'GET', null);
    
    if (passwordsResponse.success) {
      console.log('✅ Accès aux mots de passe réussi');
      console.log(`Nombre de mots de passe: ${passwordsResponse.data.data?.passwords?.length || 0}`);
    } else {
      console.log('❌ Accès aux mots de passe échoué:', passwordsResponse.data);
      
      // 5. Essayer avec l'en-tête d'organisation explicite
      console.log('\n5. Test avec en-tête d\'organisation explicite...');
      const passwordsWithOrgResponse = await fetch(`${API_URL}/passwords`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8082',
          'Cookie': getCookies(),
          'x-organization-id': '11111111-2222-3333-4444-555555555555'
        }
      });
      
      const passwordsWithOrgData = await passwordsWithOrgResponse.json();
      
      if (passwordsWithOrgResponse.ok) {
        console.log('✅ Accès avec en-tête d\'organisation réussi');
        console.log(`Nombre de mots de passe: ${passwordsWithOrgData.data?.passwords?.length || 0}`);
      } else {
        console.log('❌ Accès avec en-tête d\'organisation échoué:', passwordsWithOrgData);
      }
    }
    
    console.log('\n=== TEST TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
createOrganizationMember().catch(console.error);
