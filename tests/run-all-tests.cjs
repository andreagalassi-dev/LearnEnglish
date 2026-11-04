// Automated Integration Test Suite for LinguaNet AI
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3001;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('======================================================');
  console.log('🧪 Avvio Test Suite Integrata LinguaNet AI');
  console.log('======================================================\n');

  // 1. Verify build files exist
  console.log('📦 1. Verifica file di build frontend...');
  assert(fs.existsSync(path.join(__dirname, '../dist/index.html')), 'dist/index.html esiste');
  assert(fs.existsSync(path.join(__dirname, '../public/favicon.png')), 'public/favicon.png esiste');
  assert(fs.existsSync(path.join(__dirname, '../public/favicon.svg')), 'public/favicon.svg esiste');

  // Start server process programmatically or connect to existing
  console.log('\n🌐 2. Verifica Connettività Server e Health Check...');
  try {
    const health = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.body.status === 'ok', 'GET /health restituisce status 200 ok');
  } catch (err) {
    console.error('Server non risponde sulla porta 3001. Assicurati che il server sia avviato:', err.message);
    process.exit(1);
  }

  // 3. User Registration
  console.log('\n👤 3. Verifica Registrazione Utente...');
  const testUser = `test_user_${Date.now()}`;
  const testPass = 'SecurePass123!';

  const regRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: testUser, password: testPass });

  assert(regRes.status === 201 && regRes.body.userId, `Registrazione utente '${testUser}' completata (status 201)`);

  // 4. Duplicate user test
  const dupRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: testUser.toUpperCase(), password: testPass });

  assert(dupRes.status === 409, 'Prevenzione duplicazione username case-insensitive (status 409)');

  // 5. User Login
  console.log('\n🔑 4. Verifica Login ed Emissione Token JWT...');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: testUser, password: testPass });

  assert(loginRes.status === 200 && loginRes.body.token, 'Login riuscito con rilascio del token JWT');
  const userToken = loginRes.body.token;

  // 6. User Profile (Me)
  console.log('\n📋 5. Verifica Profilo /api/auth/me...');
  const meRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  assert(meRes.status === 200 && meRes.body.user.username === testUser, 'GET /api/auth/me restituisce il profilo corretto');

  // 7. Data Storage & Retrieval
  console.log('\n💾 6. Verifica Salvataggio e Recupero Dati Utente (/api/data)...');
  const sampleData = {
    chat: [{ id: 1, text: 'Hello tutor!', sender: 'user', timestamp: new Date().toISOString() }],
    progress: { grammarAccuracy: 95, dailyStats: { correctMessages: 5 } },
    user: { proficiencyLevel: 'Intermedio' }
  };

  const saveDataRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    }
  }, { data: sampleData });

  assert(saveDataRes.status === 200 && saveDataRes.body.success, 'POST /api/data salvataggio riuscito');

  const getDataRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/data',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });

  assert(getDataRes.status === 200 && getDataRes.body.data && getDataRes.body.data.progress.grammarAccuracy === 95, 'GET /api/data recupero dati salvati coerente');

  // 8. AI Chat Endpoint
  console.log('\n🤖 7. Verifica Endpoint AI Tutor (/api/ai/chat)...');
  const aiRes = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/ai/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    message: 'Hello, I want to learn English verbs!',
    history: [],
    level: 'Principiante',
    recentMistakes: []
  });

  assert(aiRes.status === 200, 'POST /api/ai/chat restituisce status 200');
  assert(typeof aiRes.body.text === 'string' && aiRes.body.text.length > 0, 'La risposta AI contiene il campo "text"');
  assert(typeof aiRes.body.translation === 'string', 'La risposta AI contiene la traduzione in italiano');
  assert(typeof aiRes.body.grammarScore === 'number', 'La risposta AI calcola il grammarScore (0-100)');
  assert(Array.isArray(aiRes.body.vocabularyWords), 'La risposta AI estrae vocabularyWords in un array');

  // 9. Admin Permissions
  console.log('\n🛡️ 8. Verifica Permessi e Ruolo Admin (/api/admin)...');
  const userAdminForbidden = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/admin/users',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  assert(userAdminForbidden.status === 403, 'Utente standard riceve 403 Forbidden su /api/admin/users');

  const adminLogin = await request({
    hostname: '127.0.0.1',
    port: PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { username: 'admin', password: 'Admin' });

  if (adminLogin.status === 200 && adminLogin.body.token) {
    const adminToken = adminLogin.body.token;
    const adminUsers = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/users',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminUsers.status === 200 && Array.isArray(adminUsers.body), 'Admin riceve 200 OK con elenco utenti su /api/admin/users');
  } else {
    console.log('  ⚠️ NOTA: Admin predefinito non verificato con credenziali standard');
  }

  console.log('\n======================================================');
  console.log(`📊 Risultati Test: ${passed} Passati, ${failed} Falliti`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite terminata con errore:', err);
  process.exit(1);
});
