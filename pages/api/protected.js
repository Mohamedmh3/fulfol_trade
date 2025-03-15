export default function handler(req, res) {
    const apiKey = req.headers['x-api-key']; 
    if ( apiKey !==process.env.apiKey) {
      return res.status(403).json({ error: "Forbidden: Invalid API Key" });
    }
  
    if (req.method === 'POST') {
      const { message } = req.body;
      return res.status(200).json({ success: true, message: `Received: ${message}` });
    }
  
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, message: "GET request authorized!" });
    }
  
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  