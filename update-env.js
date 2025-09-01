// Script pour mettre à jour le fichier .env du backend
const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const envPath = path.join(__dirname, 'Backendhydia', '.env');
const configPath = path.join(__dirname, 'supabase-config.txt');

// Lire le fichier de configuration Supabase
console.log('🔍 Lecture du fichier de configuration Supabase...');
let configContent;
try {
  configContent = fs.readFileSync(configPath, 'utf8');
} catch (err) {
  console.error(`❌ Erreur lors de la lecture du fichier ${configPath}:`, err.message);
  process.exit(1);
}

// Extraire les valeurs de configuration
const supabaseUrl = configContent.match(/SUPABASE_URL=(.+)/)?.[1];
const supabaseAnonKey = configContent.match(/SUPABASE_ANON_KEY=(.+)/)?.[1];
const supabaseServiceRoleKey = configContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1];

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error('❌ Impossible d\'extraire toutes les valeurs de configuration Supabase.');
  process.exit(1);
}

console.log('✅ Valeurs de configuration extraites:');
console.log(`- URL: ${supabaseUrl}`);
console.log(`- Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);
console.log(`- Service Role Key: ${supabaseServiceRoleKey.substring(0, 10)}...`);

// Lire le fichier .env existant
console.log(`\n🔍 Lecture du fichier ${envPath}...`);
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error(`❌ Erreur lors de la lecture du fichier ${envPath}:`, err.message);
  process.exit(1);
}

// Mettre à jour les valeurs dans le fichier .env
console.log('🔄 Mise à jour des valeurs...');
let updatedEnvContent = envContent;

// Mettre à jour l'URL Supabase
updatedEnvContent = updatedEnvContent.replace(
  /SUPABASE_URL=.*/,
  `SUPABASE_URL=${supabaseUrl}`
);

// Mettre à jour la clé anonyme
updatedEnvContent = updatedEnvContent.replace(
  /SUPABASE_ANON_KEY=.*/,
  `SUPABASE_ANON_KEY=${supabaseAnonKey}`
);

// Mettre à jour la clé de service
updatedEnvContent = updatedEnvContent.replace(
  /SUPABASE_SERVICE_ROLE_KEY=.*/,
  `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}`
);

// Mettre à jour la clé secrète (même valeur que la clé de service)
updatedEnvContent = updatedEnvContent.replace(
  /SUPABASE_SECRET_KEY=.*/,
  `SUPABASE_SECRET_KEY=${supabaseServiceRoleKey}`
);

// Sauvegarder le fichier .env mis à jour
console.log(`\n💾 Sauvegarde du fichier ${envPath}...`);
try {
  fs.writeFileSync(envPath, updatedEnvContent);
  console.log('✅ Fichier .env mis à jour avec succès!');
} catch (err) {
  console.error(`❌ Erreur lors de la sauvegarde du fichier ${envPath}:`, err.message);
  process.exit(1);
}

console.log('\n🚀 Redémarrez le serveur backend pour appliquer les changements.');
