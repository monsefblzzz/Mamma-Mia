import { PGlite } from '@electric-sql/pglite';

export class DatabaseService {
  private db: PGlite | null = null;
  private subscribers: Set<() => void> = new Set();
  
  async init() {
    // idb provides better compatibility in testing and preview environments
    this.db = new PGlite('idb://mamma-mia-db');
    await this.runMigrations();
  }

  private async runMigrations() {
    if (!this.db) return;
    
    // Add columns if they do not exist
    try {
      await this.db.exec(`
        ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
      `);
    } catch(e) {}

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(50) PRIMARY KEY,
          category_id INTEGER REFERENCES categories(id),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
          allergens TEXT[],
          is_available BOOLEAN DEFAULT TRUE,
          image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(100),
          customer_phone VARCHAR(20),
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered')),
          total DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          notes TEXT
      );


      CREATE TABLE IF NOT EXISTS order_logs (
          id SERIAL PRIMARY KEY,
          order_id INTEGER,
          old_status VARCHAR,
          new_status VARCHAR,
          changed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ingredients (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          stock_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
          unit VARCHAR(20) NOT NULL DEFAULT 'kg',
          min_stock_alert DECIMAL(10, 2) NOT NULL DEFAULT 5
      );
    `);

    // Create trigger for auditing
    await this.db.exec(`
      CREATE OR REPLACE FUNCTION log_order_status_change()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status <> OLD.status THEN
            INSERT INTO order_logs(order_id, old_status, new_status, changed_at)
            VALUES(NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await this.db.exec(`
      DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
      CREATE TRIGGER trigger_log_order_status_change
      AFTER UPDATE OF status ON orders
      FOR EACH ROW
      EXECUTE FUNCTION log_order_status_change();
    `);
    
    // Seed basic categories and products if empty
    const counts = await this.db.query<{count: string}>('SELECT COUNT(*) FROM categories');
    if (counts.rows[0].count === '0') {
      await this.db.exec(`
        INSERT INTO categories (name) VALUES ('Pizzas'), ('Bebidas'), ('Entrantes');
        INSERT INTO products (id, category_id, name, description, price, allergens) VALUES 
          ('p1', 1, 'Pizza Margherita', 'Tomate, mozzarella y albahaca fresca', 9.50, ARRAY['gluten', 'lactose']),
          ('p2', 1, 'Pizza Barbacoa', 'Tomate, mozzarella, bacon, pollo y salsa barbacoa', 12.00, ARRAY['gluten', 'lactose']),
          ('p3', 2, 'Coca-Cola', 'Refresco de cola de 33cl', 2.50, ARRAY[]::TEXT[]),
          ('p4', 3, 'Patatas Bravas', 'Patatas fritas con salsa brava casera y alioli', 5.50, ARRAY['gluten']);
      `);
    }

    const ingCounts = await this.db.query<{count: string}>('SELECT COUNT(*) FROM ingredients');
    if (ingCounts.rows[0].count === '0') {
      await this.db.exec(`
        INSERT INTO ingredients (name, stock_quantity, unit, min_stock_alert) VALUES 
          ('Masa de Pizza', 20, 'kg', 5),
          ('Queso Mozzarella', 15, 'kg', 3),
          ('Salsa de Tomate', 10, 'L', 2),
          ('Cebolla', 3, 'kg', 5),
          ('Bacon', 8, 'kg', 2);
      `);
    }
  }

  // --- INGREDIENTS METHODS ---
  async getIngredients() {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT * FROM ingredients ORDER BY name ASC');
      return res.rows;
    } catch {
      return [];
    }
  }

  async addIngredient(ingredient: {name: string, stock_quantity: number, unit: string, min_stock_alert: number}) {
    if (!this.db) return;
    try {
      await this.db.query(
        'INSERT INTO ingredients (name, stock_quantity, unit, min_stock_alert) VALUES ($1, $2, $3, $4)',
        [ingredient.name, ingredient.stock_quantity, ingredient.unit, ingredient.min_stock_alert]
      );
      this.notify();
    } catch(e) { console.error(e); }
  }

  async updateIngredient(id: number, updates: {name?: string, stock_quantity?: number, unit?: string, min_stock_alert?: number}) {
    if (!this.db) return;
    try {
      const current = await this.db.query('SELECT * FROM ingredients WHERE id = $1', [id]);
      if (current.rows.length === 0) return;
      const c = current.rows[0] as any;
      
      const name = updates.name !== undefined ? updates.name : c.name;
      const stock = updates.stock_quantity !== undefined ? updates.stock_quantity : c.stock_quantity;
      const unit = updates.unit !== undefined ? updates.unit : c.unit;
      const min_stock = updates.min_stock_alert !== undefined ? updates.min_stock_alert : c.min_stock_alert;

      await this.db.query(
        'UPDATE ingredients SET name=$1, stock_quantity=$2, unit=$3, min_stock_alert=$4 WHERE id=$5',
        [name, stock, unit, min_stock, id]
      );
      this.notify();
    } catch(e) { console.error(e); }
  }

  async deleteIngredient(id: number) {
    if (!this.db) return;
    try {
      await this.db.query('DELETE FROM ingredients WHERE id = $1', [id]);
      this.notify();
    } catch(e) { console.error(e); }
  }
  // ---------------------------

  async upsertProduct(product: any) {
    if (!this.db) return;
    
    // get or create category
    let categoryId = null;
    if (product.category) {
      let catRes = await this.db.query<{id: number}>('SELECT id FROM categories WHERE name = $1', [product.category]);
      if (catRes.rows.length === 0) {
        catRes = await this.db.query<{id: number}>('INSERT INTO categories (name) VALUES ($1) RETURNING id', [product.category]);
      }
      categoryId = catRes.rows[0].id;
    }

    const imageUrl = product.image || null;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      console.log(`[DB] Upserting product ${product.id} with Base64 image (length: ${imageUrl.length})`);
    } else if (imageUrl) {
      console.log(`[DB] Upserting product ${product.id} with URL image: ${imageUrl.substring(0, 50)}...`);
    }

    // Attempt to update, if 0 rows, insert
    try {
      const updateRes = await this.db.query(
        `UPDATE products SET name=$1, description=$2, price=$3, image_url=$4, category_id=$5 WHERE id=$6 RETURNING id`,
        [product.name, product.description || '', product.price, imageUrl, categoryId, product.id]
      );

      if (updateRes.rows.length === 0) {
        await this.db.query(
          `INSERT INTO products (id, name, description, price, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6)`,
          [product.id, product.name, product.description || '', product.price, imageUrl, categoryId]
        );
        console.log(`[DB] Product ${product.id} inserted successfully.`);
      } else {
        console.log(`[DB] Product ${product.id} updated successfully.`);
      }
    } catch (err: any) {
      console.error(`[DB] Error upserting product:`, err.message);
    }
    
    this.notify();
  }

  async deleteProduct(productId: string) {
    if (!this.db) return;
    await this.db.query('DELETE FROM products WHERE id = $1', [productId]);
    this.notify();
  }

  // Reactive Subscription
  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb());
  }

  async getProducts() {
    if (!this.db) return [];
    const res = await this.db.query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_available = true
    `);
    return res.rows;
  }

  async getCategories() {
    if (!this.db) return [];
    const res = await this.db.query('SELECT * FROM categories ORDER BY name ASC');
    return res.rows;
  }

  async getOrdersHistory(phone: string) {
    if (!this.db) return [];
    
    try {
      // We should get orders and order_items
      const res = await this.db.query(`
        SELECT o.id, o.customer_name, o.customer_phone, o.status, o.total, o.created_at,
               json_agg(json_build_object('name', p.name, 'quantity', oi.quantity, 'notes', oi.notes)) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.customer_phone = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [phone]);
      return res.rows;
    } catch (e: any) {
      console.error("[DB] getOrdersHistory error:", e);
      return [];
    }
  }

  async getOrders() {
    if (!this.db) return [];
    const res = await this.db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return res.rows;
  }

  async createComplexOrder(customer: string, phone: string | undefined, items: Array<{productId: string, qty: number, notes?: string}>) {
    if (!this.db) return;
    
    const orderId = await this.db.transaction(async (tx) => {
      // Calculate total
      let total = 0;
      for (const item of items) {
        const productRes = await tx.query<{price: number}>('SELECT price FROM products WHERE id = $1', [item.productId]);
        if (productRes.rows.length > 0) {
           total += Number(productRes.rows[0].price) * item.qty;
        }
      }

      const orderRes = await tx.query<{id: number}>(
        'INSERT INTO orders (customer_name, customer_phone, total) VALUES ($1, $2, $3) RETURNING id', 
        [customer, phone || null, total]
      );
      const orderId = orderRes.rows[0].id;

      for (const item of items) {
        await tx.query(
          'INSERT INTO order_items (order_id, product_id, quantity, notes) VALUES ($1, $2, $3, $4)',
          [orderId, item.productId, item.qty, item.notes || null]
        );
      }
      return orderId as number;
    });
    
    this.notify();
    return orderId;
  }
}

export const dbService = new DatabaseService();
