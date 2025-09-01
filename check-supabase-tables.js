const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://ixgncrblmyjvctrtdula.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4Z25jcmJsbXlqdmN0cnRkdWxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxNTkxMiwiZXhwIjoyMDY5MjkxOTEyfQ.-EaUGOoH2yGnq8YEfgerYrL3zObhmjjpQMpeq0X40BI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseTables() {
  console.log('🔍 Vérification des tables Supabase...\n');

  try {
    // 1. Vérifier la table users (auth.users vs public.users)
    console.log('1. Vérification de la table users...');
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('❌ Erreur auth.users:', authError.message);
      } else {
        console.log(`✅ auth.users trouvée: ${authUsers.users.length} utilisateurs`);
        if (authUsers.users.length > 0) {
          console.log('Premier utilisateur:', {
            id: authUsers.users[0].id,
            email: authUsers.users[0].email,
            created_at: authUsers.users[0].created_at
          });
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification auth.users:', error.message);
    }

    // Vérifier public.users
    try {
      const { data: publicUsers, error: publicError } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      if (publicError) {
        console.log('❌ Erreur public.users:', publicError.message);
      } else {
        console.log(`✅ public.users trouvée: ${publicUsers.length} utilisateurs`);
      }
    } catch (error) {
      console.log('❌ Table public.users n\'existe pas ou erreur:', error.message);
    }

    // 2. Vérifier la table organizations
    console.log('\n2. Vérification de la table organizations...');
    try {
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(5);
      
      if (orgError) {
        console.log('❌ Erreur organizations:', orgError.message);
        console.log('Détails:', orgError);
      } else {
        console.log(`✅ Table organizations trouvée: ${orgs.length} organisations`);
        if (orgs.length > 0) {
          console.log('Première organisation:', orgs[0]);
        }
      }
    } catch (error) {
      console.log('❌ Table organizations n\'existe pas ou erreur:', error.message);
    }

    // 3. Vérifier la table organization_members
    console.log('\n3. Vérification de la table organization_members...');
    try {
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('*')
        .limit(5);
      
      if (membersError) {
        console.log('❌ Erreur organization_members:', membersError.message);
      } else {
        console.log(`✅ Table organization_members trouvée: ${members.length} membres`);
      }
    } catch (error) {
      console.log('❌ Table organization_members n\'existe pas ou erreur:', error.message);
    }

    // 4. Vérifier la table passwords
    console.log('\n4. Vérification de la table passwords...');
    try {
      const { data: passwords, error: passwordsError } = await supabase
        .from('passwords')
        .select('*')
        .limit(5);
      
      if (passwordsError) {
        console.log('❌ Erreur passwords:', passwordsError.message);
      } else {
        console.log(`✅ Table passwords trouvée: ${passwords.length} mots de passe`);
      }
    } catch (error) {
      console.log('❌ Table passwords n\'existe pas ou erreur:', error.message);
    }

    // 5. Vérifier la table notes
    console.log('\n5. Vérification de la table notes...');
    try {
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .limit(5);
      
      if (notesError) {
        console.log('❌ Erreur notes:', notesError.message);
      } else {
        console.log(`✅ Table notes trouvée: ${notes.length} notes`);
      }
    } catch (error) {
      console.log('❌ Table notes n\'existe pas ou erreur:', error.message);
    }

    // 6. Lister toutes les tables disponibles
    console.log('\n6. Liste des tables disponibles...');
    try {
      const { data: tables, error: tablesError } = await supabase.rpc('get_schema_tables');
      if (tablesError) {
        console.log('❌ Impossible de lister les tables:', tablesError.message);
      } else {
        console.log('✅ Tables disponibles:', tables);
      }
    } catch (error) {
      // Essayer une autre méthode
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (error) {
          console.log('❌ Impossible de lister les tables via information_schema:', error.message);
        } else {
          console.log('✅ Tables publiques:', data.map(t => t.table_name));
        }
      } catch (err) {
        console.log('❌ Erreur lors de la liste des tables:', err.message);
      }
    }

    // 7. Tester l'authentification Supabase
    console.log('\n7. Test d\'authentification Supabase...');
    try {
      // Essayer de créer un utilisateur de test
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test-check@example.com',
        password: 'TestPassword123!'
      });

      if (signUpError) {
        console.log('❌ Erreur lors de l\'inscription:', signUpError.message);
      } else {
        console.log('✅ Inscription réussie:', signUpData.user?.id);
        
        // Essayer de se connecter
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'test-check@example.com',
          password: 'TestPassword123!'
        });

        if (signInError) {
          console.log('❌ Erreur lors de la connexion:', signInError.message);
        } else {
          console.log('✅ Connexion réussie:', signInData.user?.id);
          console.log('Token:', signInData.session?.access_token?.substring(0, 50) + '...');
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors du test d\'authentification:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Exécuter la vérification
checkSupabaseTables().catch(console.error);
