// Pure Node.js backend - No Express!
import http from 'http';
import mysql from 'mysql2';
import { parse } from 'url';

console.log('🟢 Starting Node.js jewellery server...');

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'jewellery_store'
});

db.connect((err) => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        return;
    }
    console.log('✅ MySQL connected successfully');
});

const server = http.createServer((req, res) => {
    // Enable CORS for React
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    console.log('📥 Request:', req.method, pathname);
    
    // ========== PRODUCTS API ==========
    
    // GET all products
    if (pathname === '/api/products' && req.method === 'GET') {
        db.query('SELECT * FROM products', (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    
    // GET single product
    else if (pathname.match(/^\/api\/products\/\d+$/) && req.method === 'GET') {
        const id = pathname.split('/').pop();
        db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
            if (err || results.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Product not found' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results[0]));
        });
    }
    
    // POST create product (Admin)
    else if (pathname === '/api/products' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { name, category, material, price, description, image_url, stock } = JSON.parse(body);
                db.query(
                    'INSERT INTO products (name, category, material, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [name, category, material, price, description, image_url, stock || 0],
                    (err, result) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ id: result.insertId, message: 'Product created' }));
                    }
                );
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    
    // PUT update product (Admin)
    else if (pathname.match(/^\/api\/products\/\d+$/) && req.method === 'PUT') {
        const id = pathname.split('/').pop();
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { name, category, material, price, description, image_url, stock } = JSON.parse(body);
                db.query(
                    'UPDATE products SET name=?, category=?, material=?, price=?, description=?, image_url=?, stock=? WHERE id=?',
                    [name, category, material, price, description, image_url, stock, id],
                    (err, result) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Product updated' }));
                    }
                );
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    
    // DELETE product (Admin)
    else if (pathname.match(/^\/api\/products\/\d+$/) && req.method === 'DELETE') {
        const id = pathname.split('/').pop();
        db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Product deleted' }));
        });
    }
    
    // GET products by material
    else if (pathname.startsWith('/api/products/material/') && req.method === 'GET') {
        const material = pathname.split('/').pop();
        db.query('SELECT * FROM products WHERE material = ?', [material], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    
    // GET products by category
    else if (pathname.startsWith('/api/products/category/') && req.method === 'GET') {
        const category = pathname.split('/').pop();
        db.query('SELECT * FROM products WHERE category = ?', [category], (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    
    // ========== USERS API ==========
    
    // GET all users (Admin)
    else if (pathname === '/api/users' && req.method === 'GET') {
        db.query('SELECT id, name, email, role, created_at FROM users', (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    
    // ========== ORDERS API ==========
    
    // GET all orders (Admin)
    else if (pathname === '/api/orders' && req.method === 'GET') {
        db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    
    // PUT update order status (Admin)
    else if (pathname.match(/^\/api\/orders\/\d+$/) && req.method === 'PUT') {
        const id = pathname.split('/').pop();
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { status } = JSON.parse(body);
                db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err, result) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Database error' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Order updated' }));
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    
    // POST create order
    else if (pathname === '/api/orders' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { user_id, items, total } = JSON.parse(body);
                console.log('📦 Creating order for user:', user_id, 'Total:', total);
                
                db.query('INSERT INTO orders (user_id, total_amount) VALUES (?, ?)', 
                    [user_id, total], 
                    (err, result) => {
                        if (err) {
                            console.error('Order insert error:', err);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error: ' + err.message }));
                            return;
                        }
                        const orderId = result.insertId;
                        console.log('✅ Order created with ID:', orderId);
                        
                        if (items && items.length > 0) {
                            items.forEach(item => {
                                db.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                                    [orderId, item.id, item.quantity, item.price]);
                            });
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ orderId, message: 'Order placed successfully' }));
                    });
            } catch (error) {
                console.error('Parse error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // ========== AUTH API ==========
    
    // POST Register
    else if (pathname === '/api/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { name, email, password } = JSON.parse(body);
                db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")', 
                    [name, email, password], 
                    (err, result) => {
                        if (err) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Email already exists' }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'User registered' }));
                    });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // POST Login
    else if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);
                db.query('SELECT * FROM users WHERE email = ?', [email], (err, users) => {
                    if (err || users.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                        return;
                    }
                    const user = users[0];
                    if (password === user.password) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            id: user.id, 
                            name: user.name, 
                            email: user.email,
                            role: user.role || 'user'
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                    }
                });
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // ========== NEWS API ==========
    
    // GET all news
    else if (pathname === '/api/news' && req.method === 'GET') {
        db.query('SELECT * FROM news ORDER BY created_at DESC', (err, results) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    }
    
    // POST create news (Admin)
    else if (pathname === '/api/news' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { title, content, date, status } = JSON.parse(body);
                db.query(
                    'INSERT INTO news (title, content, date, status) VALUES (?, ?, ?, ?)',
                    [title, content, date || new Date().toISOString(), status || 'published'],
                    (err, result) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Database error' }));
                            return;
                        }
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ id: result.insertId, message: 'News created' }));
                    }
                );
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }
    
    // DELETE news (Admin)
    else if (pathname.match(/^\/api\/news\/\d+$/) && req.method === 'DELETE') {
        const id = pathname.split('/').pop();
        db.query('DELETE FROM news WHERE id = ?', [id], (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'News deleted' }));
        });
    }
    
    // 404 for other routes
    else {
        console.log('❌ 404 Not Found:', req.method, pathname);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

const PORT = 5001;
server.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`✅ Available endpoints:`);
    console.log(`   - GET  /api/products`);
    console.log(`   - POST /api/register`);
    console.log(`   - POST /api/login`);
    console.log(`   - GET  /api/orders`);
    console.log(`   - POST /api/orders`);
    console.log(`   - GET  /api/news`);
    console.log(`   - POST /api/news`);
    console.log(`\n`);
});