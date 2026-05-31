import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { PGlite } from '@electric-sql/pglite';
import webPush from 'web-push';

async function setupDatabase() {
  const isProd = process.env.NODE_ENV === "production";
  const sourceDbPath = path.join(process.cwd(), "database_pg");
  const dbPath = isProd ? "/tmp/database_pg" : sourceDbPath;

  if (isProd) {
    const fs = await import('fs');
    if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
      console.log('Copying existing database_pg to /tmp/database_pg...');
      fs.cpSync(sourceDbPath, dbPath, { recursive: true });
    }
  }

  let db: PGlite;
  try {
    db = new PGlite(dbPath);
    await db.exec(`SELECT 1`); // Test connection
  } catch (err) {
    console.warn("Failed to initialize PGlite on disk, falling back to memory database.", err);
    db = new PGlite("memory://");
  }

  try {
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

    CREATE TABLE IF NOT EXISTS push_logs (
      id TEXT PRIMARY KEY,
      title TEXT,
      body TEXT,
      sentAt BIGINT,
      successCount INTEGER,
      failureCount INTEGER,
      details_json TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriber_push_status (
      id TEXT PRIMARY KEY,
      phone TEXT,
      endpoint TEXT,
      status TEXT,
      error_message TEXT,
      updated_at BIGINT
    );
  `);
  } catch (err) {
    console.error("Critical error during database schema creation:", err);
  }
  return db;
}

async function startServer() {
  try {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

  // API: Get Lifetime Order Value
  app.get('/api/users/:phone/lifetime-value', async (req, res) => {
    try {
      const { phone } = req.params;
      const result = await db.query("SELECT SUM(total) as lifetime_total FROM orders WHERE phone = $1 AND status = 'COMPLETADO'", [phone]);
      const lifetimeTotal = (result.rows[0] as any)?.lifetime_total || 0;
      res.json({ lifetimeValue: Number(lifetimeTotal) });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API: Get push delivery logs from Admin App
  app.get('/api/push/subscriber-status', async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM subscriber_push_status ORDER BY updated_at DESC LIMIT 100');
      res.json(result.rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
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

  // API: Update User fields (PATCH)
  app.patch('/api/users', async (req, res) => {
    try {
      const { phone, notificationToken } = req.body;
      if (!phone) return res.status(400).json({ error: "Phone is required" });
      
      const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
      if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
      
      const user: any = result.rows[0];
      const data_json = user.data_json ? JSON.parse(user.data_json as string) : {};
      
      if (notificationToken !== undefined) {
         data_json.notificationToken = notificationToken;
      }
      
      await db.query('UPDATE users SET data_json = $1 WHERE phone = $2', [JSON.stringify(data_json), phone]);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ---------- WEB PUSH Endpoints ----------
  
  app.get('/api/push/generate-keys', (req, res) => {
     const vapidKeys = webPush.generateVAPIDKeys();
     res.json(vapidKeys);
  });

  const sendPushToAll = async (title: string, body: string, db: any, vapidKey: string, vapidPrivateKey: string) => {
      webPush.setVapidDetails('mailto:soporte@mammamia.com', vapidKey, vapidPrivateKey);
      
      let successCount = 0;
      let failureCount = 0;
      const results = [];
      const id = Date.now().toString();

      try {
          const res = await db.query('SELECT * FROM users');
          const users = res.rows;
          
          for (const u of users) {
              const data = u.data_json ? JSON.parse(u.data_json as string) : {};
              if (data.notificationToken) {
                  const pushSubscription = JSON.parse(data.notificationToken);
                  try {
                      // notificationToken is a stringified PushSubscription object
                      await webPush.sendNotification(pushSubscription, JSON.stringify({ 
                          notification: {
                              title,
                              body
                          }
                      }));
                      successCount++;
                      results.push({ phone: u.phone, status: 'success' });

                      await db.query(`
                          INSERT INTO subscriber_push_status (id, phone, endpoint, status, error_message, updated_at)
                          VALUES ($1, $2, $3, $4, $5, $6)
                          ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, error_message = EXCLUDED.error_message, updated_at = EXCLUDED.updated_at
                      `, [pushSubscription.endpoint, u.phone, pushSubscription.endpoint, 'success', '', Date.now()]);
                  } catch (e: any) {
                      console.error('Error sending push to user:', u.phone, e);
                      failureCount++;
                      results.push({ phone: u.phone, status: 'error', error: e.message });

                      await db.query(`
                          INSERT INTO subscriber_push_status (id, phone, endpoint, status, error_message, updated_at)
                          VALUES ($1, $2, $3, $4, $5, $6)
                          ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, error_message = EXCLUDED.error_message, updated_at = EXCLUDED.updated_at
                      `, [pushSubscription.endpoint, u.phone, pushSubscription.endpoint, 'error', e.message, Date.now()]);
                  }
              }
          }

          await db.query(`
              INSERT INTO push_logs (id, title, body, sentAt, successCount, failureCount, details_json) 
              VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [id, title, body, Date.now(), successCount, failureCount, JSON.stringify(results)]);
          
      } catch(e) {
          console.error(e);
      }
      return { successCount, failureCount, id };
  };

  app.post('/api/push/notify', async (req, res) => {
      try {
          const { title, body, vapidKey, vapidPrivateKey, phone } = req.body;
          if (!vapidKey || !vapidPrivateKey) return res.status(400).json({ error: "Missing VAPID keys" });
          webPush.setVapidDetails('mailto:soporte@mammamia.com', vapidKey, vapidPrivateKey);
          
          // Send to specific user by phone
          const result = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
          if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
          
          const u: any = result.rows[0];
          const data = u.data_json ? JSON.parse(u.data_json as string) : {};
          
          if (data.notificationToken) {
              const pushSubscription = JSON.parse(data.notificationToken);
              try {
                  await webPush.sendNotification(pushSubscription, JSON.stringify({
                      notification: { title, body }
                  }));
                  
                  // Log the single push
                  await db.query(`
                      INSERT INTO push_logs (id, title, body, sentAt, successCount, failureCount, details_json) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7)
                  `, [Date.now().toString(), title, body, Date.now(), 1, 0, JSON.stringify([{ phone, status: 'success' }])]);
                  
                  await db.query(`
                      INSERT INTO subscriber_push_status (id, phone, endpoint, status, error_message, updated_at)
                      VALUES ($1, $2, $3, $4, $5, $6)
                      ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, error_message = EXCLUDED.error_message, updated_at = EXCLUDED.updated_at
                  `, [pushSubscription.endpoint, phone, pushSubscription.endpoint, 'success', '', Date.now()]);
                  
              } catch (pushErr: any) {
                  // Log format
                  await db.query(`
                      INSERT INTO push_logs (id, title, body, sentAt, successCount, failureCount, details_json) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7)
                  `, [Date.now().toString(), title, body, Date.now(), 0, 1, JSON.stringify([{ phone, status: 'error', error: pushErr.message }])]);
                  
                  await db.query(`
                      INSERT INTO subscriber_push_status (id, phone, endpoint, status, error_message, updated_at)
                      VALUES ($1, $2, $3, $4, $5, $6)
                      ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, error_message = EXCLUDED.error_message, updated_at = EXCLUDED.updated_at
                  `, [pushSubscription.endpoint, phone, pushSubscription.endpoint, 'error', pushErr.message, Date.now()]);
              }
              res.json({ success: true });
          } else {
              res.status(400).json({ error: "User has no notification token" });
          }
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  });

  app.post('/api/push/test', async (req, res) => {
      try {
          const { vapidKey, vapidPrivateKey } = req.body;
          if (!vapidKey || !vapidPrivateKey) return res.status(400).json({ error: "Missing VAPID keys" });
          const result = await sendPushToAll("Prueba de Notificación", "¡El sistema VAPID está configurado correctamente!", db, vapidKey, vapidPrivateKey);
          res.json(result);
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  });
  
  app.post('/api/push/broadcast', async (req, res) => {
      try {
          const { vapidKey, vapidPrivateKey, title, body } = req.body;
          if (!vapidKey || !vapidPrivateKey) return res.status(400).json({ error: "Missing VAPID keys" });
          const result = await sendPushToAll(title, body, db, vapidKey, vapidPrivateKey);
          res.json(result);
      } catch (e: any) {
          res.status(500).json({ error: e.message });
      }
  });
  
  app.get('/api/push/logs', async (req, res) => {
      try {
          const result = await db.query('SELECT * FROM push_logs ORDER BY sentAt DESC');
          const logs = result.rows.map((r: any) => ({
              ...r,
              sentAt: Number(r.sentat),
              details: JSON.parse(r.details_json || '[]')
          }));
          logs.forEach(l => {
              delete l.sentat;
              delete l.details_json;
          });
          res.json(logs);
      } catch(e: any) {
          res.status(500).json({ error: e.message });
      }
  });


  
  // API Route for Gemini Food Recommendations & Order Parsing
  app.post("/api/gemini/recommend", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not defined" });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { preferences, menuData } = req.body;
      
      const prompt = `Eres un asistente virtual de pedidos de una pizzería (Mamma Mia Nules). 
      El cliente ha dicho: "${preferences}".
      
      Tu trabajo es devolver UNICAMENTE un objeto JSON estructurado con la recomendación y la lista de todos los productos mencionados en cantidades.
      Carta disponible:
      ${JSON.stringify(menuData)}
      
      Devuelve ESTRICTAMENTE este JSON:
      {
        "reply": "Tu recomendación conversacional amigable aquí en 2 frases",
        "order": {
          "pizzas": [{"name": "nombre", "qty": 1, "notes": "ej: mitad x mitad y"}],
          "bebidas": [{"name": "nombre", "qty": 1}],
          "otros": [{"name": "nombre", "qty": 1}]
        }
      }
      Nunca uses markdown blocks ni digas nada fuera del JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Inventory Alerts
  app.post("/api/inventory/alert", async (req, res) => {
    try {
      const { id, name, stock, minLevel } = req.body;
      console.log(`[ALERT] Inventory for ${name} (ID: ${id}) has dropped below minimum level! Current stock: ${stock}, Min: ${minLevel}`);
      
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER && process.env.ADMIN_PHONE_NUMBER) {
          const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await client.messages.create({
             body: `ALERTA DE INVENTARIO: ${name} está por debajo del nivel mínimo (${stock} <= ${minLevel}). Por favor, reponga el stock.`,
             from: process.env.TWILIO_PHONE_NUMBER,
             to: process.env.ADMIN_PHONE_NUMBER
          });
          console.log("SMS sent via Twilio.");
      } else {
          console.log("No Twilio credentials found in environment. SMS not sent.");
      }
      
      res.json({ success: true });
    } catch (e: any) {
      console.error("Alert error", e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : true 
      },
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
  } catch (err: any) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
