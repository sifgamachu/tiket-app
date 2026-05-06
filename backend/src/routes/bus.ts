import { Router } from 'express';
import { query } from '../db.js';
import { z } from 'zod';

export const busRouter = Router();

const SearchSchema = z.object({
  from: z.string().length(2),
  to: z.string().length(2),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/buses/search?from=AA&to=BD&date=2026-04-18
busRouter.get('/search', async (req, res, next) => {
  try {
    const params = SearchSchema.parse(req.query);
    const buses = await query(
      `SELECT b.*, op.name AS operator_name, op.color AS operator_color
       FROM buses b
       JOIN bus_operators op ON op.id = b.operator_id
       WHERE b.from_city = $1 AND b.to_city = $2 AND b.travel_date = $3
       ORDER BY b.dep_hhmm ASC`,
      [params.from, params.to, params.date]
    );
    res.json({ results: buses, count: buses.length });
  } catch (e) { next(e); }
});

// GET /api/buses/:id
busRouter.get('/:id', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM buses WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'not_found', message: 'Bus not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});
