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
      const { action, lead, uid, leads } = req.body;
      const current = await redis.get('dfl_submissions') || [];
      let currentLeads = Array.isArray(current) ? current : [];

      if (action === 'save') {
        const idx = currentLeads.findIndex(l => l.uid === lead.uid);
        if (idx > -1) {
          const existingTime = new Date(currentLeads[idx].updatedAt || 0).getTime();
          const newTime = new Date(lead.updatedAt || 0).getTime();
          if (newTime >= existingTime) {
            currentLeads[idx] = lead;
          }
        } else {
          currentLeads.unshift(lead);
        }
      } else if (action === 'delete') {
        currentLeads = currentLeads.filter(l => l.uid !== uid);
      } else if (leads) {
        // Fallback for full array overwrite
        currentLeads = leads;
      }
      
      await redis.set('dfl_submissions', currentLeads);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
