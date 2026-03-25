const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

app.get('/', (req, res) => res.send('Bus Timetable API ✅'));

app.get('/api/timetable', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT b.bus_number, b.operator, r.origin, r.destination,
             t.departure_time, t.arrival_time, t.days
      FROM timetable t
      JOIN routes r ON t.route_id = r.id
      JOIN buses b ON r.bus_id = b.id
      ORDER BY t.departure_time
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/timetable/search', async (req, res) => {
  const { from, to } = req.query;
  try {
    const [rows] = await db.query(`
      SELECT b.bus_number, b.operator, r.origin, r.destination,
             t.departure_time, t.arrival_time, t.days
      FROM timetable t
      JOIN routes r ON t.route_id = r.id
      JOIN buses b ON r.bus_id = b.id
      WHERE r.origin LIKE ? AND r.destination LIKE ?
      ORDER BY t.departure_time
    `, [`%${from}%`, `%${to}%`]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Running on port ${PORT}`));
