// Express.js backend 
import express from 'express';
import mysql from 'mysql2';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

console.log('🟢 Starting Node.js jewellery server with Express...');

const app = express();
const PORT = 5001;

// ========== KHALTI CONFIG (KPG-2 ePayment API) ==========
// Get your test secret key from the Khalti merchant test dashboard:
// https://test-admin.khalti.com  ->  Settings -> Keys
// The old khalti-checkout.iffe.js widget (KPG-1) used in older tutorials
// is discontinued — Khalti now requires this server-side flow instead.
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY; // e.g. "test_secret_key_xxxxxxxx"
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2/epayment';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ========== MIDDLEWARE ==========
app.use(cors({
    origin: 'http://localhost:5173', // Your React frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Automatically parses JSON bodies!

// ========== MYSQL CONNECTION ==========
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
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'siddhisilvercraft88@gmail.com',
        pass: 'zode emwf xqaq zvrx'
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: 'Siddhi Jewells <siddhisilvercraft88@gmail.com>',
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

// ========== SEND ORDER CONFIRMATION EMAIL ==========
const sendOrderConfirmationEmail = async (email, name, orderId, items, total, payment_method, shipping_address, phone, fullName) => {
    let itemsHtml = '';
    if (items && items.length > 0) {
        items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">Product #${item.id}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price * item.quantity}</td>
                </tr>
            `;
        });
    }

    const paymentMethodLabels = {
        'cod': 'Cash on Delivery',
        'esewa': 'Esewa',
        'khalti': 'Khalti'
    };
    const paymentLabel = paymentMethodLabels[payment_method] || payment_method || 'Cash on Delivery';

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f0eb; border-radius: 10px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #8B4513, #CD853F); border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0;">SIDDHI JEWELLS</h1>
                <p style="color: #f5e6d3;">✨ Authentic Tibetan Jewellery</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #361a07;">Order Confirmation 🎉</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Hello <strong>${fullName || name}</strong>,
                </p>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                    Thank you for your order! We're happy to confirm that we've received your order and are processing it.
                </p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderId}</p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentLabel}</p>
                    ${shipping_address ? `<p style="margin: 5px 0;"><strong>Shipping Address:</strong> ${shipping_address}</p>` : ''}
                    ${phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
                </div>
                
                <h3 style="color: #361a07; border-bottom: 2px solid #f0e6d2; padding-bottom: 10px;">Order Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <thead>
                        <tr style="background: #f5f0eb;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml || '<tr><td colspan="4" style="padding: 10px; text-align: center;">Items not available</td></tr>'}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                            <td style="padding: 10px; text-align: right;">Rs. ${total}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                            <td style="padding: 10px; text-align: right;">Free</td>
                        </tr>
                        <tr style="background: #f5f0eb;">
                            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #8B4513;">Rs. ${total}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style="background: #f5f0eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #555; font-size: 14px; margin: 5px 0;">
                        <strong>📦 Order Status:</strong> Your order has been confirmed and is being processed.
                        ${payment_method === 'cod' ? 'You will pay cash on delivery.' : 'Payment has been received.'}
                    </p>
                    <p style="color: #555; font-size: 14px; margin: 5px 0;">
                        <strong>📧 Questions?</strong> If you have any questions, please contact us at info@siddhijewells.com
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                    © 2026 Siddhi Jewells. All rights reserved.<br>
                    Jyatha, Kathmandu, Nepal
                </p>
            </div>
        </div>
    `;

    await sendEmail(email, `Order Confirmation #${orderId} - Siddhi Jewells`, emailHtml);
};

const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// ========== CREATE TABLES ==========
db.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))
    )
`, (err) => { if (err) console.error('Error creating password_resets table:', err); else console.log('✅ password_resets table ready'); });

db.query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR))
    )
`, (err) => { if (err) console.error('Error creating email_verifications table:', err); else console.log('✅ email_verifications table ready'); });

db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE
`, (err) => { if (err) console.error('Error adding verified column:', err); else console.log('✅ verified column ready'); });

// ========== PRODUCTS ROUTES ==========

// GET all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// GET single product
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(results[0]);
    });
});

// POST create product (Admin)
app.post('/api/products', (req, res) => {
    const { name, category, material, price, description, image_url, stock } = req.body;
    db.query(
        'INSERT INTO products (name, category, material, price, description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, category, material, price, description, image_url, stock || 0],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.status(201).json({ id: result.insertId, message: 'Product created' });
        }
    );
});

// PUT update product (Admin)
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const { name, category, material, price, description, image_url, stock } = req.body;
    db.query(
        'UPDATE products SET name=?, category=?, material=?, price=?, description=?, image_url=?, stock=? WHERE id=?',
        [name, category, material, price, description, image_url, stock, id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.json({ message: 'Product updated' });
        }
    );
});

// DELETE product (Admin)
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Product deleted' });
    });
});

// GET products by material
app.get('/api/products/material/:material', (req, res) => {
    const material = req.params.material;
    db.query('SELECT * FROM products WHERE material = ?', [material], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// GET products by category
app.get('/api/products/category/:category', (req, res) => {
    const category = req.params.category;
    db.query('SELECT * FROM products WHERE category = ?', [category], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// ========== USERS ROUTES ==========

// GET all users (Admin)
app.get('/api/users', (req, res) => {
    db.query('SELECT id, name, email, role, verified, created_at FROM users', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// ========== ORDERS ROUTES ==========

// GET all orders (Admin)
app.get('/api/orders', (req, res) => {
    db.query('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// PUT update order status (Admin)
app.put('/api/orders/:id', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Order updated' });
    });
});

// ========== POST create order with confirmation email ==========
app.post('/api/orders', (req, res) => {
    const { user_id, items, total, payment_method, shipping_address, phone, fullName } = req.body;
    console.log('📦 Creating order for user:', user_id, 'Total:', total, 'Payment:', payment_method || 'cod');
    
    // First get user email
    db.query('SELECT email, name FROM users WHERE id = ?', [user_id], async (err, userResults) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        const userEmail = userResults[0]?.email || '';
        const userName = userResults[0]?.name || 'Customer';
        
        db.query(
            'INSERT INTO orders (user_id, total_amount, payment_method, shipping_address, phone, customer_name) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, total, payment_method || 'cod', shipping_address || '', phone || '', fullName || ''],
            (err, result) => {
                if (err) {
                    console.error('Order insert error:', err);
                    res.status(500).json({ error: 'Database error: ' + err.message });
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
                
                // ========== SEND ORDER CONFIRMATION EMAIL ==========
                if (userEmail) {
                    sendOrderConfirmationEmail(userEmail, userName, orderId, items, total, payment_method, shipping_address, phone, fullName);
                }
                
                res.status(201).json({ orderId, message: 'Order placed successfully' });
            }
        );
    });
});

// ========== KHALTI PAYMENT ROUTES (KPG-2) ==========

// POST initiate a Khalti payment — call this after the order is created
app.post('/api/payment/khalti/initiate', async (req, res) => {
    const { orderId, amount, fullName, email, phone } = req.body;

    if (!orderId || !amount) {
        return res.status(400).json({ error: 'orderId and amount are required' });
    }
    if (!KHALTI_SECRET_KEY) {
        console.error('❌ KHALTI_SECRET_KEY is not set in backend/.env');
        return res.status(500).json({ error: 'Khalti is not configured on the server' });
    }

    try {
        const response = await axios.post(`${KHALTI_BASE_URL}/initiate/`, {
            return_url: `${FRONTEND_URL}/`,
            website_url: FRONTEND_URL,
            amount: Math.round(amount * 100), // Khalti expects paisa
            purchase_order_id: String(orderId),
            purchase_order_name: `Siddhi Jewells Order #${orderId}`,
            customer_info: {
                name: fullName || 'Customer',
                email: email || 'customer@example.com',
                phone: phone || '9800000000'
            }
        }, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Remember the pidx against this order so we can verify it later
        db.query('UPDATE orders SET pidx = ? WHERE id = ?', [response.data.pidx, orderId], (err) => {
            if (err) console.error('⚠️ Could not store pidx (did you add the pidx column?):', err.message);
        });

        res.json({ payment_url: response.data.payment_url, pidx: response.data.pidx });
    } catch (error) {
        console.error('❌ Khalti initiate error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initiate Khalti payment', detail: error.response?.data });
    }
});

// POST verify a Khalti payment — call this once the user is redirected back
app.post('/api/payment/khalti/verify', async (req, res) => {
    const { pidx, orderId } = req.body;

    if (!pidx) {
        return res.status(400).json({ error: 'pidx is required' });
    }
    if (!KHALTI_SECRET_KEY) {
        return res.status(500).json({ error: 'Khalti is not configured on the server' });
    }

    try {
        const response = await axios.post(`${KHALTI_BASE_URL}/lookup/`, { pidx }, {
            headers: {
                Authorization: `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const status = response.data.status; // Completed | Pending | Expired | User canceled | Refunded

        if (status === 'Completed' && orderId) {
            db.query('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?', ['paid', 'processing', orderId], (err) => {
                if (err) console.error('⚠️ Could not update order payment status (did you add the payment_status column?):', err.message);
            });
        }

        res.json({ status, detail: response.data });
    } catch (error) {
        console.error('❌ Khalti verify error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to verify Khalti payment', detail: error.response?.data });
    }
});

// ========== AUTH ROUTES ==========

// POST Register with email verification
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.query('INSERT INTO users (name, email, password, role, verified) VALUES (?, ?, ?, "user", FALSE)',
            [name, email, hashedPassword],
            async (err, result) => {
                if (err) {
                    res.status(400).json({ error: 'Email already exists' });
                    return;
                }
                
                const token = generateToken();
                
                db.query('INSERT INTO email_verifications (email, token) VALUES (?, ?)',
                    [email, token],
                    (err) => { if (err) console.error('Error storing verification token:', err); }
                );
                
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
                
                res.status(201).json({
                    success: true,
                    message: 'Registration successful! Please check your email to verify your account.'
                });
            }
        );
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
});

// POST Verify Email
app.post('/api/verify-email', (req, res) => {
    const { token, email } = req.body;
    
    db.query('SELECT * FROM email_verifications WHERE email = ? AND token = ? AND expires_at > NOW()',
        [email, token],
        (err, results) => {
            if (err || results.length === 0) {
                res.status(400).json({ error: 'Invalid or expired verification link' });
                return;
            }
            
            db.query('UPDATE users SET verified = TRUE WHERE email = ?',
                [email],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: 'Database error' });
                        return;
                    }
                    
                    db.query('DELETE FROM email_verifications WHERE email = ?', [email]);
                    
                    res.json({
                        success: true,
                        message: 'Email verified successfully! You can now login.'
                    });
                }
            );
        }
    );
});

// POST Login with verification check
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, users) => {
            if (err || users.length === 0) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            
            const user = users[0];
            
            if (!user.verified) {
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
                
                res.status(403).json({
                    error: 'Please verify your email first. A new verification link has been sent to your email.',
                    needsVerification: true
                });
                return;
            }
            
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (passwordMatch) {
                res.json({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'user',
                    verified: user.verified
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
});

// POST Forgot Password
app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, users) => {
            if (err || users.length === 0) {
                res.status(404).json({ error: 'Email not found' });
                return;
            }
            
            const user = users[0];
            const token = generateToken();
            
            db.query('INSERT INTO password_resets (email, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?, created_at = NOW()',
                [email, token, token]);
            
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
            
            res.json({
                success: true,
                message: 'Password reset link has been sent to your email!'
            });
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
});

// POST Reset Password
app.post('/api/reset-password', async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;
        
        db.query('SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > NOW()',
            [email, token],
            async (err, results) => {
                if (err || results.length === 0) {
                    res.status(400).json({ error: 'Invalid or expired reset link' });
                    return;
                }
                
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                db.query('UPDATE users SET password = ? WHERE email = ?',
                    [hashedPassword, email],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: 'Database error' });
                            return;
                        }
                        
                        db.query('DELETE FROM password_resets WHERE email = ?', [email]);
                        
                        res.json({
                            success: true,
                            message: 'Password reset successfully! You can now login with your new password.'
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ error: 'Invalid data' });
    }
});

// ========== NEWS ROUTES ==========

// GET all news
app.get('/api/news', (req, res) => {
    db.query('SELECT * FROM news ORDER BY created_at DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// POST create news (Admin)
app.post('/api/news', (req, res) => {
    const { title, content, date, status } = req.body;
    db.query(
        'INSERT INTO news (title, content, date, status) VALUES (?, ?, ?, ?)',
        [title, content, date || new Date().toISOString(), status || 'published'],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Database error' });
                return;
            }
            res.status(201).json({ id: result.insertId, message: 'News created' });
        }
    );
});

// DELETE news (Admin)
app.delete('/api/news/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM news WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'News deleted' });
    });
});

// ========== 404 Handler ==========
app.use((req, res) => {
    console.log('❌ 404 Not Found:', req.method, req.path);
    res.status(404).json({ error: 'Route not found' });
});

// ========== START SERVER ==========
app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`✅ Available endpoints:`);
    console.log(`   - GET  /api/products`);
    console.log(`   - POST /api/register (with email verification)`);
    console.log(`   - POST /api/verify-email`);
    console.log(`   - POST /api/login (checks verification)`);
    console.log(`   - POST /api/forgot-password`);
    console.log(`   - POST /api/reset-password`);
    console.log(`   - GET  /api/orders`);
    console.log(`   - POST /api/orders (with payment & shipping & email confirmation)`);
    console.log(`   - GET  /api/news`);
    console.log(`   - POST /api/news`);
    console.log(`\n`);
});