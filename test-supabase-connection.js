// Test Supabase connection
const dns = require('dns');
const https = require('https');
const net = require('net');

console.log('Starting Supabase connection test...');

// Test with multiple Supabase URLs to check if it's a specific URL issue
const SUPABASE_URLS = [
  'eldheqbjgcwjavnosnus.supabase.co',  // Original URL from .env.example
  'supabase.co',                       // Main Supabase domain
  'app.supabase.com'                   // Supabase dashboard
];

// Test DNS resolution for each URL
async function testDNS(url) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing DNS resolution for ${url}...`);
    dns.lookup(url, (err, address, family) => {
      if (err) {
        console.error(`❌ DNS resolution failed for ${url}: ${err.message}`);
        resolve(false);
      } else {
        console.log(`✅ DNS resolution successful: ${url} -> ${address} (IPv${family})`);
        resolve(true);
      }
    });
  });
}

// Test HTTPS connection
async function testHTTPS(url) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing HTTPS connection to ${url}...`);
    const req = https.request({
      hostname: url,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log(`✅ HTTPS connection successful to ${url}: Status ${res.statusCode}`);
      res.on('data', () => {});
      res.on('end', () => {
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ HTTPS connection failed to ${url}: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.error(`❌ Connection timed out to ${url}`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('=== DNS RESOLUTION TESTS ===');
  for (const url of SUPABASE_URLS) {
    await testDNS(url);
  }
  
  console.log('\n=== HTTPS CONNECTION TESTS ===');
  for (const url of SUPABASE_URLS) {
    await testHTTPS(url);
  }
  
  console.log('\n=== RECOMMENDATIONS ===');
  console.log('If the original Supabase URL failed but others worked:');
  console.log('1. Check if your Supabase project ID is correct');
  console.log('2. Verify the Supabase URL in your .env file');
  console.log('3. Check if the Supabase project exists and is active');
  console.log('4. Try creating a new Supabase project if needed');
}

runTests();
