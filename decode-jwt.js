// Script pour décoder un token JWT
// Utiliser le token JWT extrait du script de test des notes
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyN2E4OTFlZi00MjJhLTQ5YzQtYjllZC0wZjU2MjQ5ZDM0NDIiLCJlbWFpbCI6ImFudG9pbmVyb25vbGRAcHJvdG9uLm1lIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1NjgwNDk2NywiZXhwIjoxNzU2ODA1ODY3fQ.4ArKpWZGqEJTgMTnRZN_RF7eAJZTuY17b8qz6_d6PgA";

console.log('=== ANALYSE DU TOKEN JWT ===');
console.log('Token à analyser:', token);

// Fonction pour extraire le token JWT d'un cookie
function extractTokenFromCookie(cookie) {
  if (!cookie) return null;
  const match = cookie.match(/hydia_sess_access=([^;]+)/);
  return match ? match[1] : null;
}

// Fonction pour décoder un token JWT sans vérification de signature
function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Format JWT invalide');
  }
  
  const payload = parts[1];
  const decoded = Buffer.from(payload, 'base64').toString();
  return JSON.parse(decoded);
}

try {
  // Décoder le token
  const decodedToken = decodeJwt(token);
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
} catch (error) {
  console.error('Erreur lors du décodage du token:', error.message);
}
