// Script pour vérifier le schéma de la base de données
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = 'https://ixgncrblmyjvctrtdula.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxNTkxMiwiZXhwIjoyMDY5MjkxOTEyfQ.-EaUGOoH2yGnq8YEfgerYrL3zObhmjjpQMpeq0X40BI';

// Créer un client Supabase avec la clé de service (admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('🔍 Vérification du schéma de la base de données...');
  
  try {
    // Vérifier la structure de la table organizations
    const { data: orgColumns, error: orgError } = await supabase.rpc('get_table_columns', { 
      table_name: 'organizations' 
    });
    
    if (orgError) {
      console.error('❌ Erreur lors de la vérification de la table organizations:', orgError);
      
      // Essayer une autre approche
      console.log('🔄 Tentative avec une requête SQL directe...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.error('❌ Erreur lors de la récupération des tables:', tablesError);
      } else {
        console.log('📋 Tables disponibles:', tables.map(t => t.table_name).join(', '));
        
        // Essayer de créer une organisation avec un minimum de champs
        console.log('🔄 Tentative de création d\'une organisation simplifiée...');
        const { data: testOrg, error: testOrgError } = await supabase
          .from('organizations')
          .insert([{ name: 'Test Org' }])
          .select();
        
        if (testOrgError) {
          console.error('❌ Erreur lors de la création d\'une organisation simplifiée:', testOrgError);
        } else {
          console.log('✅ Organisation créée avec succès:', testOrg);
        }
      }
    } else {
      console.log('📋 Colonnes de la table organizations:');
      orgColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }
    
    // Vérifier si la table organization_members existe
    const { data: memberTables, error: memberTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', '%organization%');
    
    if (memberTablesError) {
      console.error('❌ Erreur lors de la vérification des tables d\'organisation:', memberTablesError);
    } else {
      console.log('📋 Tables d\'organisation disponibles:', memberTables.map(t => t.table_name).join(', '));
    }
    
  } catch (err) {
    console.error('❌ Erreur inattendue:', err);
  }
}

checkSchema().catch(console.error);
