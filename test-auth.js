// Test script for authentication flow
const { default: fetch } = require('node-fetch');

// Use the same API URL as the frontend
const API_URL = 'http://localhost:3000/api/v1';
const FRONTEND_URL = 'http://localhost:8082';

// Afficher les informations de configuration
console.log('Configuration de test:');
console.log(`- API URL: ${API_URL}`);
console.log(`- Frontend URL: ${FRONTEND_URL}`);
console.log('-----------------------------------');

async function testAuth() {
  console.log('🔍 Testing authentication flow...');
  
  try {
    // 1. Test login endpoint
    console.log('\n📡 Testing login endpoint...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
      credentials: 'include'
    });
    
    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log('Response:', JSON.stringify(loginData, null, 2));
    
    // Get cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies:', cookies);
    
    // 2. Test /me endpoint with cookies
    if (loginResponse.status === 200) {
      console.log('\n📡 Testing /me endpoint...');
      const meResponse = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Cookie': cookies
        },
        credentials: 'include'
      });
      
      const meData = await meResponse.json();
      console.log(`Status: ${meResponse.status}`);
      console.log('Response:', JSON.stringify(meData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAuth();
