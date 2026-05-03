import { Redis } from '@upstash/redis';

// Using the exact environment variables injected by Vercel Upstash integration
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await redis.get('dfl_submissions');
      // Upstash returns the parsed object if it was stored as JSON, 
      // but let's be safe and return what we got or an empty array.
      return res.status(200).json(data || []);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { leads } = req.body;
      // Store the leads directly
      await redis.set('dfl_submissions', leads);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
