// Script pour tester la création de mots de passe avec différents utilisateurs
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:3001/api/v1';
const USERS = [
  {
    email: 'test@example.com',
    password: 'password123',
    expectedUserId: 'test-user-id-123'
  },
  {
    email: 'Antoineronold@proton.me',
    password: 'Antoineronold@proton.me',
    expectedUserId: 'antoine-user-id-456'
  }
];

// Fonction pour extraire les cookies d'une réponse
const extractCookies = (headers) => {
  const cookies = {};
  const cookieHeader = headers.get('set-cookie');
  
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(',').forEach(cookie => {
    const parts = cookie.split(';')[0].trim().split('=');
    if (parts.length === 2) {
      cookies[parts[0]] = parts[1];
    }
  });
  
  return cookies;
};

// Fonction pour se connecter
const login = async (email, password) => {
  console.log(`\n🔑 Tentative de connexion avec ${email}...`);
  
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  const cookies = extractCookies(response.headers);
  
  console.log(`✅ Connexion réussie pour ${email}`);
  console.log(`📋 Réponse complète:`, JSON.stringify(data, null, 2));
  
  // Vérifier si les données sont structurées comme prévu
  if (data && data.data && data.data.user) {
    console.log(`📋 Données utilisateur:`, JSON.stringify(data.data.user, null, 2));
    console.log(`🏢 Organisation actuelle: ${data.data.currentOrgId || 'Non définie'}`);
  } else {
    console.log(`⚠️ Structure de réponse inattendue`);
  }
  
  return {
    user: data.data.user,
    cookies,
    currentOrgId: data.data.currentOrgId
  };
};

// Fonction pour créer un mot de passe
const createPassword = async (sessionCookies, passwordData) => {
  console.log(`\n🔒 Création d'un mot de passe: ${passwordData.title}`);
  
  const cookieString = Object.entries(sessionCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  const response = await fetch(`${API_URL}/passwords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieString
    },
    body: JSON.stringify(passwordData)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erreur lors de la création du mot de passe: ${response.status}`);
    console.error(errorText);
    return null;
  }
  
  const data = await response.json();
  console.log(`✅ Mot de passe créé avec succès: ID=${data.data.id}`);
  return data.data;
};

// Fonction pour récupérer les mots de passe
const getPasswords = async (sessionCookies) => {
  console.log(`\n📋 Récupération des mots de passe...`);
  
  const cookieString = Object.entries(sessionCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  const response = await fetch(`${API_URL}/passwords`, {
    method: 'GET',
    headers: {
      'Cookie': cookieString
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erreur lors de la récupération des mots de passe: ${response.status}`);
    console.error(errorText);
    return [];
  }
  
  const data = await response.json();
  console.log(`✅ ${data.data.length} mots de passe récupérés`);
  return data.data;
};

// Fonction principale pour exécuter les tests
const runTests = async () => {
  console.log('Démarrage des tests...');
  try {
    // Tester avec le premier utilisateur
    const session1 = await login(USERS[0].email, USERS[0].password);
    
    // Créer un mot de passe pour le premier utilisateur
    const password1 = await createPassword(session1.cookies, {
      title: "Compte GitHub",
      username: "user1",
      password: "GitHubPass123!",
      url: "https://github.com",
      notes: "Compte principal GitHub"
    });
    
    // Récupérer les mots de passe du premier utilisateur
    const passwords1 = await getPasswords(session1.cookies);
    console.log(`📊 Mots de passe de ${USERS[0].email}:`, passwords1.map(p => p.title));
    
    // Tester avec le deuxième utilisateur
    const session2 = await login(USERS[1].email, USERS[1].password);
    
    // Créer un mot de passe pour le deuxième utilisateur
    const password2 = await createPassword(session2.cookies, {
      title: "Compte Twitter",
      username: "user2",
      password: "TwitterPass456!",
      url: "https://twitter.com",
      notes: "Compte professionnel Twitter"
    });
    
    // Récupérer les mots de passe du deuxième utilisateur
    const passwords2 = await getPasswords(session2.cookies);
    console.log(`📊 Mots de passe de ${USERS[1].email}:`, passwords2.map(p => p.title));
    
    // Vérifier que les utilisateurs ont accès uniquement à leurs propres mots de passe
    console.log("\n🔍 Vérification de l'isolation des données:");
    console.log(`👤 ${USERS[0].email} a ${passwords1.length} mot(s) de passe`);
    console.log(`👤 ${USERS[1].email} a ${passwords2.length} mot(s) de passe`);
    
    const user1HasUser2Passwords = passwords1.some(p => p.title === "Compte Twitter");
    const user2HasUser1Passwords = passwords2.some(p => p.title === "Compte GitHub");
    
    if (!user1HasUser2Passwords && !user2HasUser1Passwords) {
      console.log("✅ SUCCÈS: Les données sont correctement isolées entre les utilisateurs!");
    } else {
      console.log("❌ ÉCHEC: Les données ne sont pas correctement isolées entre les utilisateurs!");
    }
    
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des tests:", error);
  }
};

// Exécuter les tests
runTests().catch(error => {
  console.error('Erreur non gérée:', error);
});

// Afficher un message à la fin
setTimeout(() => {
  console.log('Script terminé.');
}, 1000);
