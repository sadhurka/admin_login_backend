

// Helper to parse JSON body robustly for all environments
async function getParsedBody(req) {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) return req.body;
  if (req.body && typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch {}
  }
  if (typeof req.text === 'function') {
    try { return JSON.parse(await req.text()); } catch {}
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const { MongoClient } = await import('mongodb');
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db(process.env.MONGODB_DB || 'registration');
  const users = db.collection(process.env.MONGODB_COLLECTION || 'login');

  if (req.method === 'POST') {
    const data = await getParsedBody(req);
    // Only extract email, password, action
    const email = data?.email;
    const password = data?.password;
    const action = data?.action;
    if (!email || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Email and password required' }));
      await client.close();
      return;
    }
    if (action === 'signup') {
      const exists = await users.findOne({ email });
      if (exists) {
        res.statusCode = 409;
        res.end(JSON.stringify({ error: 'User already exists' }));
        await client.close();
        return;
      }
      await users.insertOne({ email, password });
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true }));
      await client.close();
      return;
    }
    if (action === 'login') {
      const user = await users.findOne({ email, password });
      if (!user) {
        res.statusCode = 401;
        res.end(JSON.stringify({ error: 'Invalid credentials' }));
        await client.close();
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, email }));
      await client.close();
      return;
    }
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid action' }));
    await client.close();
    return;
  }

  // GET: return all users (for admin/testing only)
  if (req.method === 'GET') {
    const usersList = await users.find({}, { projection: { password: 0 } }).toArray();
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(usersList));
    await client.close();
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
}

// ...your auth API code should be here...

// If you lost this file, restore it from your previous backup or version control.
// If you need a minimal working version, copy your last working auth.js here.
