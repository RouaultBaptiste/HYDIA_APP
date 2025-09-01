const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';

// Nouvel utilisateur de test
const newUser = {
  email: 'test.hydia@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
};

async function testUserCreation() {
  console.log('🔍 Test de création d\'utilisateur avec le nouveau système Supabase\n');
  
  try {
    // 1. Essayer de créer un nouveau compte
    console.log('1. Création d\'un nouveau compte...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL
      },
      body: JSON.stringify(newUser)
    });
    
    console.log(`Statut de la réponse: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    console.log('Réponse inscription:', JSON.stringify(registerData, null, 2));
    
    if (registerResponse.ok && registerData.success) {
      console.log('✅ Compte créé avec succès');
      
      // Récupérer les cookies
      const cookies = registerResponse.headers.raw()['set-cookie'];
      if (cookies) {
        const cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
        
        // 2. Tester le profil utilisateur
        console.log('\n2. Test du profil utilisateur...');
        const profileResponse = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Cookie': cookieHeader,
            'Origin': FRONTEND_URL
          }
        });
        
        console.log(`Statut profil: ${profileResponse.status}`);
        const profileData = await profileResponse.json();
        console.log('Profil:', JSON.stringify(profileData, null, 2));
        
        if (profileResponse.ok && profileData.success) {
          console.log('✅ Profil récupéré avec succès');
          
          // 3. Tester la connexion avec les mêmes identifiants
          console.log('\n3. Test de connexion...');
          const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': FRONTEND_URL
            },
            body: JSON.stringify({
              email: newUser.email,
              password: newUser.password
            })
          });
          
          console.log(`Statut connexion: ${loginResponse.status}`);
          const loginData = await loginResponse.json();
          console.log('Connexion:', JSON.stringify(loginData, null, 2));
          
          if (loginResponse.ok && loginData.success) {
            console.log('✅ Connexion réussie');
            
            // Récupérer les nouvelles cookies de connexion
            const loginCookies = loginResponse.headers.raw()['set-cookie'];
            if (loginCookies) {
              const loginCookieHeader = loginCookies.map(cookie => cookie.split(';')[0]).join('; ');
              
              // 4. Tester les organisations
              console.log('\n4. Test des organisations...');
              const orgsResponse = await fetch(`${API_URL}/organizations`, {
                method: 'GET',
                headers: {
                  'Cookie': loginCookieHeader,
                  'Origin': FRONTEND_URL
                }
              });
              
              console.log(`Statut organisations: ${orgsResponse.status}`);
              const orgsData = await orgsResponse.json();
              console.log('Organisations:', JSON.stringify(orgsData, null, 2));
              
              if (orgsResponse.ok && orgsData.success) {
                console.log(`✅ ${orgsData.data?.organizations?.length || 0} organisations trouvées`);
              } else {
                console.log('❌ Échec de la récupération des organisations');
              }
            }
          } else {
            console.log('❌ Échec de la connexion');
          }
        } else {
          console.log('❌ Échec de la récupération du profil');
        }
      }
    } else {
      console.log('❌ Échec de la création du compte');
      
      // Si le compte existe déjà, essayer de se connecter
      if (registerData.error?.message?.includes('already registered') || 
          registerData.error?.message?.includes('User already registered')) {
        console.log('\n📝 Le compte existe déjà, test de connexion...');
        
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': FRONTEND_URL
          },
          body: JSON.stringify({
            email: newUser.email,
            password: newUser.password
          })
        });
        
        console.log(`Statut connexion: ${loginResponse.status}`);
        const loginData = await loginResponse.json();
        console.log('Connexion:', JSON.stringify(loginData, null, 2));
        
        if (loginResponse.ok && loginData.success) {
          console.log('✅ Connexion réussie avec compte existant');
        } else {
          console.log('❌ Échec de la connexion avec compte existant');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Exécuter le test
testUserCreation().catch(console.error);
