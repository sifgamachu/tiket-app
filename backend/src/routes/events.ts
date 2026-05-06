import { Router } from 'express';
import { query } from '../db.js';

export const eventsRouter = Router();

// GET /api/events?category=sports
eventsRouter.get('/', async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    const events = category
      ? await query(
          `SELECT e.*, COALESCE(json_agg(t.* ORDER BY t.price) FILTER (WHERE t.id IS NOT NULL), '[]') AS tiers
           FROM events e LEFT JOIN event_tiers t ON t.event_id = e.id
           WHERE e.category = $1 AND e.event_date >= NOW()
           GROUP BY e.id ORDER BY e.event_date ASC`,
          [category]
        )
      : await query(
          `SELECT e.*, COALESCE(json_agg(t.* ORDER BY t.price) FILTER (WHERE t.id IS NOT NULL), '[]') AS tiers
           FROM events e LEFT JOIN event_tiers t ON t.event_id = e.id
           WHERE e.event_date >= NOW()
           GROUP BY e.id ORDER BY e.event_date ASC`
        );
    res.json({ results: events, count: events.length });
  } catch (e) { next(e); }
});

// GET /api/events/:id
eventsRouter.get('/:id', async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT e.*, COALESCE(json_agg(t.* ORDER BY t.price) FILTER (WHERE t.id IS NOT NULL), '[]') AS tiers
       FROM events e LEFT JOIN event_tiers t ON t.event_id = e.id
       WHERE e.id = $1 GROUP BY e.id LIMIT 1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'not_found', message: 'Event not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});
