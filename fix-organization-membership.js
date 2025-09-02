// Script pour vérifier et corriger le membership d'organisation
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utiliser les valeurs de test
const supabaseUrl = 'https://example.supabase.co';
const supabaseServiceKey = 'test-service-role-key';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const userId = '27a891ef-422a-49c4-b9ed-0f56249d3442';
const organizationId = '11111111-2222-3333-4444-555555555555';

async function checkAndFixMembership() {
  console.log('=== VÉRIFICATION ET CORRECTION DU MEMBERSHIP ===');
  
  try {
    // 1. Vérifier si l'utilisateur existe
    console.log('\n1. Vérification de l\'utilisateur...');
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error('❌ Utilisateur non trouvé:', userError);
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`
    });
    
    // 2. Vérifier si l'organisation existe
    console.log('\n2. Vérification de l\'organisation...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, description')
      .eq('id', organizationId)
      .single();
    
    if (orgError || !org) {
      console.error('❌ Organisation non trouvée:', orgError);
      return;
    }
    
    console.log('✅ Organisation trouvée:', {
      id: org.id,
      name: org.name,
      description: org.description
    });
    
    // 3. Vérifier le membership existant
    console.log('\n3. Vérification du membership existant...');
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('id, role, is_active, created_at')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .single();
    
    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la vérification du membership:', membershipError);
      return;
    }
    
    if (membership) {
      console.log('✅ Membership existant trouvé:', {
        id: membership.id,
        role: membership.role,
        isActive: membership.is_active,
        createdAt: membership.created_at
      });
      
      if (!membership.is_active) {
        console.log('\n4. Activation du membership...');
        const { error: updateError } = await supabase
          .from('organization_members')
          .update({ 
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', membership.id);
        
        if (updateError) {
          console.error('❌ Erreur lors de l\'activation:', updateError);
          return;
        }
        
        console.log('✅ Membership activé avec succès');
      } else {
        console.log('✅ Membership déjà actif');
      }
    } else {
      console.log('❌ Aucun membership trouvé, création en cours...');
      
      // 4. Créer le membership
      console.log('\n4. Création du membership...');
      const { data: newMembership, error: createError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role: 'admin',
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erreur lors de la création du membership:', createError);
        return;
      }
      
      console.log('✅ Membership créé avec succès:', {
        id: newMembership.id,
        role: newMembership.role,
        isActive: newMembership.is_active
      });
    }
    
    // 5. Vérification finale
    console.log('\n5. Vérification finale du membership...');
    const { data: finalMembership, error: finalError } = await supabase
      .from('organization_members')
      .select('id, role, is_active')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (finalError || !finalMembership) {
      console.error('❌ Vérification finale échouée:', finalError);
      return;
    }
    
    console.log('✅ Vérification finale réussie:', {
      id: finalMembership.id,
      role: finalMembership.role,
      isActive: finalMembership.is_active
    });
    
    // 6. Lister tous les membres de l'organisation
    console.log('\n6. Liste de tous les membres de l\'organisation...');
    const { data: allMembers, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        is_active,
        created_at,
        profiles!organization_members_user_id_fkey (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true);
    
    if (membersError) {
      console.error('❌ Erreur lors de la récupération des membres:', membersError);
      return;
    }
    
    console.log(`✅ ${allMembers.length} membre(s) actif(s) dans l'organisation:`);
    allMembers.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.profiles.email} (${member.role})`);
    });
    
    console.log('\n=== CORRECTION TERMINÉE AVEC SUCCÈS ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la correction
checkAndFixMembership().catch(console.error);
