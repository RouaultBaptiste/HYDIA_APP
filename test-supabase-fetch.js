// Test de connexion à Supabase avec fetch
const { default: fetch } = require('node-fetch');

// Nouvelles informations Supabase
const SUPABASE_URL = 'https://ixgncrblmyjvctrtdula.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTU5MTIsImV4cCI6MjA2OTI5MTkxMn0.2_iHWilZF_vH9Lv-eHXVuCcP9sAqEMooOGTKRd8F_K4';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxNTkxMiwiZXhwIjoyMDY5MjkxOTEyfQ.-EaUGOoH2yGnq8YEfgerYrL3zObhmjjpQMpeq0X40BI';

async function testConnection() {
  console.log('🔍 Test de connexion à Supabase avec fetch...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  try {
    // Test de connexion simple avec fetch
    console.log('\n📡 Test de connexion HTTPS...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    console.log(`Status: ${response.status}`);
    if (response.ok) {
      console.log('✅ Connexion HTTPS réussie!');
      const data = await response.json();
      console.log('Réponse:', data);
    } else {
      console.log('❌ Erreur de connexion HTTPS:', await response.text());
    }
    
    // Test d'authentification avec fetch
    console.log('\n📡 Test d\'authentification...');
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    console.log(`Status: ${authResponse.status}`);
    if (authResponse.ok) {
      console.log('✅ Authentification réussie!');
      const authData = await authResponse.json();
      console.log('Données d\'authentification:', authData);
    } else {
      console.log('❌ Erreur d\'authentification:', await authResponse.text());
      console.log('Note: Cette erreur est normale si l\'utilisateur n\'existe pas.');
    }
    
  } catch (err) {
    console.error('❌ Exception lors du test de connexion:', err);
  }
}

// Exécuter le test
testConnection();
