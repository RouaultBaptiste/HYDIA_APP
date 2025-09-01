// Script pour créer une organisation pour l'utilisateur de test
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration Supabase
const SUPABASE_URL = 'https://ixgncrblmyjvctrtdula.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxNTkxMiwiZXhwIjoyMDY5MjkxOTEyfQ.-EaUGOoH2yGnq8YEfgerYrL3zObhmjjpQMpeq0X40BI';

// Créer un client Supabase avec la clé de service (admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createOrganization() {
  console.log('🔍 Création d\'une organisation pour l\'utilisateur de test...');
  
  // Charger les informations de l'utilisateur de test
  let testUser;
  try {
    testUser = JSON.parse(fs.readFileSync('test-user.json', 'utf8'));
  } catch (err) {
    console.error('❌ Impossible de charger les informations de l\'utilisateur de test:', err.message);
    process.exit(1);
  }
  
  const organization = {
    name: 'Organisation de Test',
    description: 'Organisation créée pour les tests',
    owner_id: testUser.id
  };
  
  try {
    // Créer l'organisation
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert([organization])
      .select()
      .single();
    
    if (orgError) {
      console.error('❌ Erreur lors de la création de l\'organisation:', orgError);
      process.exit(1);
    }
    
    console.log('✅ Organisation créée avec succès!');
    console.log('Détails de l\'organisation:');
    console.log(`- ID: ${orgData.id}`);
    console.log(`- Nom: ${orgData.name}`);
    
    // Associer l'utilisateur à l'organisation
    const userOrg = {
      user_id: testUser.id,
      organization_id: orgData.id,
      role: 'owner'
    };
    
    const { data: userOrgData, error: userOrgError } = await supabase
      .from('organization_members')
      .insert([userOrg])
      .select()
      .single();
    
    if (userOrgError) {
      console.error('❌ Erreur lors de l\'association de l\'utilisateur à l\'organisation:', userOrgError);
      process.exit(1);
    }
    
    console.log('✅ Utilisateur associé à l\'organisation avec succès!');
    console.log(`- Rôle: ${userOrgData.role}`);
    
    // Sauvegarder les informations de l'organisation
    const orgInfo = {
      ...orgData,
      user_role: userOrgData.role
    };
    
    fs.writeFileSync('test-organization.json', JSON.stringify(orgInfo, null, 2));
    console.log('📝 Informations de l\'organisation sauvegardées dans test-organization.json');
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
    process.exit(1);
  }
}

createOrganization().catch(console.error);
