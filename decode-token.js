// Script simple pour décoder un token JWT
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyN2E4OTFlZi00MjJhLTQ5YzQtYjllZC0wZjU2MjQ5ZDM0NDIiLCJlbWFpbCI6ImFudG9pbmVyb25vbGRAcHJvdG9uLm1lIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1NjgwNDk2NywiZXhwIjoxNzU2ODA1ODY3fQ.4ArKpWZGqEJTgMTnRZN_RF7eAJZTuY17b8qz6_d6PgA";

console.log('=== ANALYSE DU TOKEN JWT ===');

// Fonction pour décoder un token JWT sans vérification de signature
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Format JWT invalide');
    }
    
    const payload = parts[1];
    // Gérer le padding manquant pour la base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    const decoded = Buffer.from(padded, 'base64').toString();
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Erreur de décodage:', error);
    return null;
  }
}

// Décoder le token
const decodedToken = decodeJwt(token);
if (decodedToken) {
  console.log('Token décodé:', JSON.stringify(decodedToken, null, 2));

  // Vérifier l'expiration
  const now = Math.floor(Date.now() / 1000);
  console.log('\nTimestamp actuel:', now);
  console.log('Timestamp d\'expiration:', decodedToken.exp);
  console.log('Différence (secondes):', decodedToken.exp - now);

  if (now > decodedToken.exp) {
    console.log('❌ Le token est expiré');
  } else {
    console.log('✅ Le token est valide temporellement');
  }

  // Afficher les informations importantes du token
  console.log('\nInformations du token:');
  console.log('- Type:', decodedToken.type);
  console.log('- User ID:', decodedToken.userId);
  console.log('- Email:', decodedToken.email);
  console.log('- Émis à:', new Date(decodedToken.iat * 1000).toISOString());
  console.log('- Expire à:', new Date(decodedToken.exp * 1000).toISOString());
} else {
  console.log('❌ Impossible de décoder le token');
}
