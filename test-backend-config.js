// Test de la configuration du backend
const fetch = require('node-fetch');

async function testBackendConfig() {
  console.log('🔍 Test de la configuration du backend...');
  
  try {
    // Test de l'endpoint de configuration (à créer)
    console.log('\n📡 Test de l\'endpoint de configuration...');
    const response = await fetch('http://localhost:3000/api/v1/config/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Configuration récupérée!');
      console.log('Configuration:', data);
    } else {
      console.log('❌ Erreur lors de la récupération de la configuration:', await response.text());
    }
  } catch (err) {
    console.error('❌ Exception lors du test:', err);
  }
}

// Exécuter le test
testBackendConfig();
