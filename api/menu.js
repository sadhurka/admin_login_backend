// Dummy menu API for login/signup-only backend

export default function handler(req, res) {
  res.statusCode = 404;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify({ error: 'Menu API not implemented in this backend.' }));
}
