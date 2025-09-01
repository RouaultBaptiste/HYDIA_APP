// Script pour créer un utilisateur de test dans Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration Supabase
const SUPABASE_URL = 'https://ixgncrblmyjvctrtdula.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ La clé de service Supabase n\'est pas définie dans les variables d\'environnement.');
  console.log('Veuillez définir SUPABASE_SERVICE_ROLE_KEY avant d\'exécuter ce script.');
  process.exit(1);
}

// Créer un client Supabase avec la clé de service (admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTestUser() {
  console.log('🔍 Création d\'un utilisateur de test dans Supabase...');
  
  const testUser = {
    email: 'Antoineronold@proton.me',
    password: 'Antoineronold@proton.me',
    user_metadata: {
      firstName: 'Antoine',
      lastName: 'Ronold'
    }
  };
  
  try {
    // Créer l'utilisateur avec l'API d'administration
    const { data, error } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      user_metadata: testUser.user_metadata,
      email_confirm: true // Confirmer automatiquement l'email
    });
    
    if (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error.message);
      return;
    }
    
    console.log('✅ Utilisateur de test créé avec succès!');
    console.log('Détails de l\'utilisateur:');
    console.log(`- ID: ${data.user.id}`);
    console.log(`- Email: ${data.user.email}`);
    console.log(`- Nom: ${testUser.user_metadata.firstName} ${testUser.user_metadata.lastName}`);
    
    // Sauvegarder les informations de l'utilisateur pour les tests
    fs.writeFileSync('test-user.json', JSON.stringify({
      id: data.user.id,
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.user_metadata.firstName,
      lastName: testUser.user_metadata.lastName
    }, null, 2));
    
    console.log('📝 Informations de l\'utilisateur sauvegardées dans test-user.json');
    
  } catch (err) {
    console.error('❌ Exception lors de la création de l\'utilisateur:', err);
  }
}

// Exécuter la fonction
createTestUser();
