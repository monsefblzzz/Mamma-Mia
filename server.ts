import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { PGlite } from '@electric-sql/pglite';

const DB_PATH = path.join(process.cwd(), 'database_pg');

async function setupDatabase() {
  const db = new PGlite(DB_PATH);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT UNIQUE,
      address TEXT,
      zone TEXT,
      role TEXT,
      verified BOOLEAN,
      hasUsedWelcomeCoupon BOOLEAN,
      data_json TEXT
    );
    
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT,
      phone TEXT,
      time TEXT,
      date TEXT,
      createdAt BIGINT,
      status TEXT,
      type TEXT,
      total REAL,
      address TEXT,
      table_id TEXT,
      paymentMethod TEXT,
      items_json TEXT
    );
  `);
  return db;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Setup Database
  const db = await setupDatabase();

  // ----- SQL DB Endpoints -----
  
  // API: Get Users
  app.get('/api/users', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM users');
      const users = result.rows.map((r: any) => ({
        ...r,
        verified: r.verified ? true : false,
        hasUsedWelcomeCoupon: r.hasusedwelcomecoupon ? true : false,
        ...(r.data_json ? JSON.parse(r.data_json) : {})
      }));
      // Remove raw properties to avoid duplicates
      users.forEach(u => delete u.hasusedwelcomecoupon);
      res.json(users);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // API: Save User
  app.post('/api/users', async (req, res) => {
    try {
      const user = req.body;
      const { id, name, phone, address, zone, role, verified, hasUsedWelcomeCoupon, ...rest } = user;
      await db.query(`
        INSERT INTO users (id, name, phone, address, zone, role, verified, hasUsedWelcomeCoupon, data_json)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT(id) DO UPDATE SET
          name=EXCLUDED.name, phone=EXCLUDED.phone, address=EXCLUDED.address, zone=EXCLUDED.zone,
          role=EXCLUDED.role, verified=EXCLUDED.verified, hasUsedWelcomeCoupon=EXCLUDED.hasUsedWelcomeCoupon, data_json=EXCLUDED.data_json
      `, [id, name, phone, address, zone, role, verified ? true : false, hasUsedWelcomeCoupon ? true : false, JSON.stringify(rest)]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // API: Save Multiple Users (Batch)
  app.post('/api/users/batch', async (req, res) => {
    try {
      const users = req.body.users;
      if (!Array.isArray(users)) return res.status(400).json({error: "Expected array"});
      
      for (const user of users) {
        const { id, name, phone, address, zone, role, verified, hasUsedWelcomeCoupon, ...rest } = user;
        await db.query(`
          INSERT INTO users (id, name, phone, address, zone, role, verified, hasUsedWelcomeCoupon, data_json)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT(id) DO UPDATE SET
            name=EXCLUDED.name, phone=EXCLUDED.phone, address=EXCLUDED.address, zone=EXCLUDED.zone,
            role=EXCLUDED.role, verified=EXCLUDED.verified, hasUsedWelcomeCoupon=EXCLUDED.hasUsedWelcomeCoupon, data_json=EXCLUDED.data_json
        `, [id, name, phone, address, zone, role, verified ? true : false, hasUsedWelcomeCoupon ? true : false, JSON.stringify(rest)]);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // API: Get Orders
  app.get('/api/orders', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM orders ORDER BY createdAt DESC');
      const orders = result.rows.map((r: any) => ({
        ...r,
        createdAt: Number(r.createdat),
        paymentMethod: r.paymentmethod || r.paymentMethod,
        items: JSON.parse(r.items_json || '[]')
      }));
      // remove DB columns we don't map directly
      orders.forEach(o => {
        delete o.items_json;
        delete o.createdat;
        delete o.paymentmethod;
      });
      res.json(orders);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // API: Save Order
  app.post('/api/orders', async (req, res) => {
    try {
      const order = req.body;
      const { id, customer, phone, time, date, createdAt, status, type, total, address, table, paymentMethod, items } = order;
      await db.query(`
        INSERT INTO orders (id, customer, phone, time, date, createdAt, status, type, total, address, table_id, paymentMethod, items_json)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT(id) DO UPDATE SET
          customer=EXCLUDED.customer, phone=EXCLUDED.phone, time=EXCLUDED.time, date=EXCLUDED.date, status=EXCLUDED.status, type=EXCLUDED.type, total=EXCLUDED.total, address=EXCLUDED.address, table_id=EXCLUDED.table_id, paymentMethod=EXCLUDED.paymentMethod, items_json=EXCLUDED.items_json
      `, [id, customer, phone, time, date, createdAt, status, type, total, address, table, paymentMethod, JSON.stringify(items || [])]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // API: Update Order Status
  app.patch('/api/orders/:id', async (req, res) => {
    try {
      const { status } = req.body;
      await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  // API: Order Batch (initial sync if none exist locally)
  app.post('/api/orders/batch', async (req, res) => {
    try {
       const orders = req.body.orders;
       if (!Array.isArray(orders)) return res.status(400).json({error: "Expected array"});
      
      for (const order of orders) {
         const { id, customer, phone, time, date, createdAt, status, type, total, address, table, paymentMethod, items } = order;
         await db.query(`
          INSERT INTO orders (id, customer, phone, time, date, createdAt, status, type, total, address, table_id, paymentMethod, items_json)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT(id) DO UPDATE SET
            customer=EXCLUDED.customer, phone=EXCLUDED.phone, time=EXCLUDED.time, date=EXCLUDED.date, status=EXCLUDED.status, type=EXCLUDED.type, total=EXCLUDED.total, address=EXCLUDED.address, table_id=EXCLUDED.table_id, paymentMethod=EXCLUDED.paymentMethod, items_json=EXCLUDED.items_json
        `, [id, customer, phone, time, date, createdAt, status, type, total, address, table, paymentMethod, JSON.stringify(items || [])]);
      }
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });
  
  // Wait for AI instance
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Gemini Food Recommendations
  app.post("/api/gemini/recommend", async (req, res) => {
    try {
      const { preferences, menuData } = req.body;
      
      const prompt = `Eres un asistente virtual de una pizzería/restaurante italiano (Mamma Mia Nules). 
      Un cliente te ha pedido una recomendación basada en estas preferencias: "${preferences}".
      Esta es la carta disponible (solo puedes recomendar cosas de la carta):
      ${JSON.stringify(menuData)}
      
      Recomienda 1 plato principal, y si encaja también 1 entrante o bebida, pero de forma conversacional y muy breve (máximo 2-3 frases cortas). Usa un tono amigable, italiano-español simpático, emojis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
