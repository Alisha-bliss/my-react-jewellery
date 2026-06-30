// Pure Node.js backend - No Express!
import http from 'http';
import mysql from 'mysql2';
import { parse } from 'url';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

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

// ========== EMAIL CONFIGURATION ==========
// IMPORTANT: Replace with your actual email credentials!
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
       user: 'siddhisilvercraft88@gmail.com',    // the email sending gmail
        pass: 'zode emwf xqaq zvrx'        // gmail pass link 16 character
    }
});

// Function to send email
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: 'Siddhi Jewells <your-email@gmail.com>',
            to: to,
            subject: subject,
            html: html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
};

// Generate random token
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// ========== CREATE TABLES IF NOT EXISTS ==========

// Password resets table
db.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))
    )
`, (err) => {
    if (err) console.error('Error creating password_resets table:', err);
    else console.log('✅ password_resets table ready');
});

// Email verifications table
db.query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR))
    )
`, (err) => {
    if (err) console.error('Error creating email_verifications table:', err);
    else console.log('✅ email_verifications table ready');
});

// Add verified column to users table
db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE
`, (err) => {
    if (err) console.error('Error adding verified column:', err);
    else console.log('✅ verified column ready');
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
        db.query('SELECT id, name, email, role, verified, created_at FROM users', (err, results) => {
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
    
    // POST Register with email verification
    else if (pathname === '/api/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { name, email, password } = JSON.parse(body);
                
                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                
                db.query('INSERT INTO users (name, email, password, role, verified) VALUES (?, ?, ?, "user", FALSE)', 
                    [name, email, hashedPassword], 
                    async (err, result) => {
                        if (err) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Email already exists' }));
                            return;
                        }
                        
                        // Generate verification token
                        const token = generateToken();
                        
                        // Store verification token
                        db.query('INSERT INTO email_verifications (email, token) VALUES (?, ?)',
                            [email, token],
                            (err) => {
                                if (err) console.error('Error storing verification token:', err);
                            }
                        );
                        
                        // Send verification email
                        const verificationLink = `http://localhost:5173/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
                        const emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f0eb; border-radius: 10px;">
                                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #8B4513, #CD853F); border-radius: 10px 10px 0 0;">
                                    <h1 style="color: white; margin: 0;">SIDDHI JEWELLS</h1>
                                    <p style="color: #f5e6d3;">✨ Authentic Tibetan Jewellery</p>
                                </div>
                                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                                    <h2 style="color: #361a07;">Welcome to Siddhi Jewells, ${name}! 🎉</h2>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                        Thank you for registering with us. Please verify your email address to complete your registration.
                                    </p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${verificationLink}" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                            Verify Email Address
                                        </a>
                                    </div>
                                    <p style="color: #999; font-size: 14px;">
                                        Or copy and paste this link into your browser:<br>
                                        <span style="color: #8B4513; word-break: break-all;">${verificationLink}</span>
                                    </p>
                                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                        This verification link will expire in 24 hours.
                                    </p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="color: #999; font-size: 12px; text-align: center;">
                                        © 2026 Siddhi Jewells. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        `;
                        
                        await sendEmail(email, 'Welcome to Siddhi Jewells - Verify Your Email', emailHtml);
                        
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Registration successful! Please check your email to verify your account.' 
                        }));
                    });
            } catch (error) {
                console.error('Register error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // POST Verify Email
    else if (pathname === '/api/verify-email' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { token, email } = JSON.parse(body);
                
                db.query('SELECT * FROM email_verifications WHERE email = ? AND token = ? AND expires_at > NOW()',
                    [email, token],
                    (err, results) => {
                        if (err || results.length === 0) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid or expired verification link' }));
                            return;
                        }
                        
                        // Update user as verified
                        db.query('UPDATE users SET verified = TRUE WHERE email = ?',
                            [email],
                            (err) => {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: 'Database error' }));
                                    return;
                                }
                                
                                // Delete used verification token
                                db.query('DELETE FROM email_verifications WHERE email = ?', [email]);
                                
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ 
                                    success: true, 
                                    message: 'Email verified successfully! You can now login.' 
                                }));
                            }
                        );
                    }
                );
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // POST Login with verification check
    else if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { email, password } = JSON.parse(body);
                
                db.query('SELECT * FROM users WHERE email = ?', [email], async (err, users) => {
                    if (err || users.length === 0) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                        return;
                    }
                    
                    const user = users[0];
                    
                    // Check if email is verified
                    if (!user.verified) {
                        // Generate new verification token
                        const token = generateToken();
                        db.query('INSERT INTO email_verifications (email, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?, created_at = NOW()',
                            [email, token, token]);
                        
                        const verificationLink = `http://localhost:5173/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
                        const emailHtml = `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f0eb; border-radius: 10px;">
                                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #8B4513, #CD853F); border-radius: 10px 10px 0 0;">
                                    <h1 style="color: white; margin: 0;">SIDDHI JEWELLS</h1>
                                    <p style="color: #f5e6d3;">✨ Verify Your Email</p>
                                </div>
                                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                                    <h2 style="color: #361a07;">Verify Your Email Address</h2>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                        You need to verify your email before logging in. Click the button below to verify.
                                    </p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${verificationLink}" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                            Verify Email
                                        </a>
                                    </div>
                                    <p style="color: #999; font-size: 14px;">
                                        Or copy and paste this link into your browser:<br>
                                        <span style="color: #8B4513; word-break: break-all;">${verificationLink}</span>
                                    </p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="color: #999; font-size: 12px; text-align: center;">
                                        © 2026 Siddhi Jewells. All rights reserved.
                                    </p>
                                </div>
                            </div>
                        `;
                        await sendEmail(email, 'Verify Your Email - Siddhi Jewells', emailHtml);
                        
                        res.writeHead(403, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            error: 'Please verify your email first. A new verification link has been sent to your email.',
                            needsVerification: true 
                        }));
                        return;
                    }
                    
                    // Check password
                    const passwordMatch = await bcrypt.compare(password, user.password);
                    
                    if (passwordMatch) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            id: user.id, 
                            name: user.name, 
                            email: user.email,
                            role: user.role || 'user',
                            verified: user.verified
                        }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid credentials' }));
                    }
                });
            } catch (error) {
                console.error('Login error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // POST Forgot Password
    else if (pathname === '/api/forgot-password' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { email } = JSON.parse(body);
                
                db.query('SELECT * FROM users WHERE email = ?', [email], async (err, users) => {
                    if (err || users.length === 0) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Email not found' }));
                        return;
                    }
                    
                    const user = users[0];
                    const token = generateToken();
                    
                    // Store reset token
                    db.query('INSERT INTO password_resets (email, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?, created_at = NOW()',
                        [email, token, token]);
                    
                    // Send reset email
                    const resetLink = `http://localhost:5173/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
                    const emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f0eb; border-radius: 10px;">
                            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #8B4513, #CD853F); border-radius: 10px 10px 0 0;">
                                <h1 style="color: white; margin: 0;">SIDDHI JEWELLS</h1>
                                <p style="color: #f5e6d3;">🔐 Password Reset</p>
                            </div>
                            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                                <h2 style="color: #361a07;">Hello ${user.name},</h2>
                                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                                    We received a request to reset your password for your Siddhi Jewells account.
                                </p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${resetLink}" style="background: #8B4513; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                                        Reset Password
                                    </a>
                                </div>
                                <p style="color: #999; font-size: 14px;">
                                    Or copy and paste this link into your browser:<br>
                                    <span style="color: #8B4513; word-break: break-all;">${resetLink}</span>
                                </p>
                                <p style="color: #999; font-size: 12px; margin-top: 20px;">
                                    This password reset link will expire in 1 hour.
                                </p>
                                <p style="color: #999; font-size: 12px;">
                                    If you didn't request this, please ignore this email.
                                </p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                <p style="color: #999; font-size: 12px; text-align: center;">
                                    © 2026 Siddhi Jewells. All rights reserved.
                                </p>
                            </div>
                        </div>
                    `;
                    
                    await sendEmail(email, 'Reset Your Password - Siddhi Jewells', emailHtml);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Password reset link has been sent to your email!' 
                    }));
                });
            } catch (error) {
                console.error('Forgot password error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
    }
    
    // POST Reset Password
    else if (pathname === '/api/reset-password' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', async () => {
            try {
                const { token, email, newPassword } = JSON.parse(body);
                
                db.query('SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > NOW()',
                    [email, token],
                    async (err, results) => {
                        if (err || results.length === 0) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid or expired reset link' }));
                            return;
                        }
                        
                        // Hash new password
                        const hashedPassword = await bcrypt.hash(newPassword, 10);
                        
                        // Update password
                        db.query('UPDATE users SET password = ? WHERE email = ?',
                            [hashedPassword, email],
                            (err) => {
                                if (err) {
                                    res.writeHead(500, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ error: 'Database error' }));
                                    return;
                                }
                                
                                // Delete used reset token
                                db.query('DELETE FROM password_resets WHERE email = ?', [email]);
                                
                                res.writeHead(200, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ 
                                    success: true, 
                                    message: 'Password reset successfully! You can now login with your new password.' 
                                }));
                            }
                        );
                    }
                );
            } catch (error) {
                console.error('Reset password error:', error);
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
    console.log(`   - POST /api/register (with email verification)`);
    console.log(`   - POST /api/verify-email`);
    console.log(`   - POST /api/login (checks verification)`);
    console.log(`   - POST /api/forgot-password`);
    console.log(`   - POST /api/reset-password`);
    console.log(`   - GET  /api/orders`);
    console.log(`   - POST /api/orders`);
    console.log(`   - GET  /api/news`);
    console.log(`   - POST /api/news`);
    console.log(`\n`);
});