// Test direct de connexion à Supabase
const { createClient } = require('@supabase/supabase-js');

// Nouvelles informations Supabase
const SUPABASE_URL = 'https://ixgncrblmyjvctrtdula.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTU5MTIsImV4cCI6MjA2OTI5MTkxMn0.2_iHWilZF_vH9Lv-eHXVuCcP9sAqEMooOGTKRd8F_K4';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxNTkxMiwiZXhwIjoyMDY5MjkxOTEyfQ.-EaUGOoH2yGnq8YEfgerYrL3zObhmjjpQMpeq0X40BI';

// Créer un client Supabase avec la clé de service
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Créer un client pour l'authentification
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('🔍 Test de connexion à Supabase...');
  console.log(`URL: ${SUPABASE_URL}`);
  
  try {
    // Test de connexion simple
    console.log('\n📡 Test de connexion basique...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return;
    }
    
    console.log('✅ Connexion réussie!');
    console.log('Données:', data);
    
    // Test d'authentification
    console.log('\n📡 Test d\'authentification...');
    try {
      const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });
      
      if (authError) {
        console.log('❌ Erreur d\'authentification:', authError);
        console.log('Note: Cette erreur est normale si l\'utilisateur n\'existe pas.');
      } else {
        console.log('✅ Authentification réussie!');
        console.log('Utilisateur:', authData.user);
      }
    } catch (authErr) {
      console.error('❌ Exception lors de l\'authentification:', authErr);
    }
    
  } catch (err) {
    console.error('❌ Exception lors du test de connexion:', err);
  }
}

// Exécuter le test
testConnection();
