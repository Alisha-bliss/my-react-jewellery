CREATE DATABASE jewellery_store;

USE jewellery_store;

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    material VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    stock INT DEFAULT 0
);

INSERT INTO products (name, category, material, price, description, image_url, stock) VALUES
('Tibetan Silver Ring', 'Ring', 'Silver', 2500, 'Beautiful Tibetan silver ring with traditional patterns', 'https://picsum.photos/300/300?random=1', 10),
('Amethyst Crystal Necklace', 'Necklace', 'Crystal', 3500, 'Purple amethyst crystal necklace with silver chain', 'https://picsum.photos/300/300?random=2', 8),
('Copper Bracelet', 'Bracelet', 'Copper', 1800, 'Handcrafted copper bracelet with healing properties', 'https://picsum.photos/300/300?random=3', 15),
('Gemstone Earrings', 'Earrings', 'Gemstone', 4200, 'Mixed gemstone earrings with silver setting', 'https://picsum.photos/300/300?random=4', 6),
('Silver Crystal Pendant', 'Pendant', 'Silver', 2900, 'Crystal pendant set in pure silver', 'https://picsum.photos/300/300?random=5', 12),
('Tibetan Copper Ring', 'Ring', 'Copper', 1500, 'Traditional Tibetan copper ring with mantras', 'https://picsum.photos/300/300?random=6', 20),
('Rose Quartz Necklace', 'Necklace', 'Crystal', 3800, 'Rose quartz crystal necklace for love and healing', 'https://picsum.photos/300/300?random=7', 7),
('Silver Gemstone Ring', 'Ring', 'Silver', 3200, 'Ring with mixed gemstones in silver setting', 'https://picsum.photos/300/300?random=8', 9),
('Lapis Lazuli Pendant', 'Pendant', 'Gemstone', 4500, 'Blue lapis lazuli pendant in silver', 'https://picsum.photos/300/300?random=9', 5),
('Copper Anklet', 'Anklet', 'Copper', 1200, 'Traditional copper anklet with tiny bells', 'https://picsum.photos/300/300?random=10', 25);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM products;

DESCRIBE products;

USE jewellery_store;

-- Insert more products with proper images
INSERT INTO products (name, category, material, price, description, image_url, stock) VALUES
-- Silver Products
('Tibetan Silver Ring with Turquoise', 'Ring', 'Silver', 3500, 'Beautiful silver ring with natural turquoise stone', 'https://www.stauer.com/images/products/WB169_800.jpg', 10),
('Silver Lotus Pendant', 'Pendant', 'Silver', 4200, 'Handcrafted lotus pendant in pure silver', 'https://i0.wp.com/eclecticshopuk.co.uk/wp-content/uploads/2022/02/s-l1600-1767-e1716368571185.png?fit=748%2C748&ssl=1', 8),
('Silver Om Necklace', 'Necklace', 'Silver', 5800, 'Sacred Om symbol pendant with silver chain', 'https://img.tatacliq.com/images/i19//437Wx649H/MP000000023347854_437Wx649H_202408180304241.jpeg', 12),
('Silver Earrings with Pearl', 'Earrings', 'Silver', 2800, 'Elegant silver earrings with freshwater pearls', 'https://frenelle.co.nz/cdn/shop/products/Frenelle-Jewellery-Earrings---Linda-White-Pearl-Silver-2_SQGCEALTJCBE.jpg?v=1646531318', 15),

-- Copper Products
('Tibetan Copper Bracelet', 'Bracelet', 'Copper', 2200, 'Traditional Tibetan copper bracelet with mantras', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfLeej2hbbshXxWm0Fa1tD6WCF8Z8NRnLeCA&s', 20),
('Copper Healing Ring', 'Ring', 'Copper', 1200, 'Copper ring for healing and balance', 'https://potalagate.com/cdn/shop/products/copperring_3232c170-e647-44c7-b8c8-0b1ea44173ea.jpg?v=1721590546', 25),
('Copper Anklet with Bells', 'Anklet', 'Copper', 1800, 'Traditional anklet with tiny copper bells', 'https://img.kwcdn.com/product/fancy/9472cf8e-d6f9-4a78-b60d-0e84e489e47a.jpg?imageMogr2/auto-orient%7CimageView2/2/w/800/q/70/format/webp', 18),

-- Crystal Products
('Amethyst Crystal Pendant', 'Pendant', 'Crystal', 3200, 'Purple amethyst crystal for spiritual healing', 'https://images.squarespace-cdn.com/content/v1/53e5b04ae4b07d0e4c490c41/1500512009242-5THXSPGYYFK03IZ0KQLZ/Amethyst+Point+Pendant%2C+Purple+Quartz+Necklace+10+%281%29.jpg?format=1000w', 7),
('Rose Quartz Necklace', 'Necklace', 'Crystal', 3800, 'Rose quartz crystal for love and harmony', 'https://www.spiralartjewelry.com/cdn/shop/products/Spiral_5-2020_TWC_CROPPED_2500px-2635-landscape-1_3524x.jpg?v=1598922022', 9),
('Crystal Healing Set', 'Set', 'Crystal', 6500, 'Complete set of 7 chakra crystals', 'https://www.imaginariumglastonbury.co.uk/wp-content/uploads/2023/08/NN-crystal-healing.jpg', 5),
('Clear Quartz Bracelet', 'Bracelet', 'Crystal', 2500, 'Natural clear quartz crystal bracelet', 'https://5.imimg.com/data5/SELLER/Default/2024/12/474398441/RL/OA/LO/14184655/clear-quartz-crystal-bracelet.jpg', 12),

-- Gemstone Products
('Lapis Lazuli Pendant', 'Pendant', 'Gemstone', 4500, 'Blue lapis lazuli stone in silver setting', 'https://cdn.shopify.com/s/files/1/0271/1853/4740/files/lapis-lazuli-pendant-38mm-inverted-teardrop-blue-gemstone-sterling-silver-lap03-30081953497152.jpg?v=1715694384', 6),
('Turquoise Gemstone Ring', 'Ring', 'Gemstone', 3900, 'Natural turquoise stone ring', 'https://www.en.redline-boutique.com/media/cache/catalog/product/7/5/1920x1920/759-ob-reine-bague-turquoise.jpg', 8),
('Mixed Gemstone Earrings', 'Earrings', 'Gemstone', 4800, 'Colorful mixed gemstone earrings', 'https://www.meencanta.co.uk/wp-content/uploads/2021/10/Me-Encanta-Anya-Gold-Multi-Semi-Precious-Gemstone-Long-Drop-Statement-Earrings.jpg', 5),
('Gemstone Mala Necklace', 'Necklace', 'Gemstone', 5500, '108 bead gemstone mala for meditation', 'https://cpimg.tistatic.com/09879386/b/4/Stone-Mala-Necklace-Set..jpg', 4),

-- Wedding Special
('Silver Wedding Band', 'Ring', 'Silver', 8500, 'Classic silver wedding band with engravable surface', 'https://www.artulia.com/cdn/shop/products/silver-wedding-band-set-09_740x.jpg?v=1566167045', 10),
('Bridal Silver Necklace Set', 'Set', 'Silver', 12500, 'Complete bridal necklace and earring set', 'https://m.media-amazon.com/images/I/611gVnWvPxL._AC_UY1000_.jpg', 5),
('Copper Wedding Ring', 'Ring', 'Copper', 4500, 'Traditional copper wedding ring', 'https://karizmajewels.in/cdn/shop/files/copper_ring.jpg?v=1775405321&width=416', 8),

-- Gift Items
('Gift Box - Silver & Crystal Set', 'Set', 'Silver', 8900, 'Beautiful gift box with silver pendant and crystal', 'https://contempocrystals.com/cdn/shop/files/anxiety-stress-crystal-chocolate-box-gift-set.jpg?v=1757886407', 7),
('Birthday Gift - Gemstone Bracelet', 'Bracelet', 'Gemstone', 3200, 'Special birthday gift with personalized message', 'https://i5.walmartimages.com/seo/Colorful-Natural-Stone-Bracelet-Birthday-Gift-for-12-Year-Old-13-Year-Old-16-Year-Old-18-Year-Old-21-Year-Old-Daughters-or-Granddaughters_643d9fa9-79ef-4065-84f3-ee32eca23ce6.f12889cf777639d02d17084d09ee8689.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF', 12),

-- Sale Items
('Discounted Silver Earrings', 'Earrings', 'Silver', 1500, 'Beautiful silver earrings - SALE!', 'https://www.giva.co/cdn/shop/files/ER0140_5_0ba2cba8-05d6-45da-ba57-0e5315f75f7a.jpg?v=1765273355&width=533', 20),
('Clearance Copper Bracelet', 'Bracelet', 'Copper', 800, 'Copper bracelet - Clearance sale!', 'https://i.etsystatic.com/26474623/r/il/bfb34d/5970771594/il_1080xN.5970771594_jyhf.jpg', 15);

SELECT id, name, material, price, image_url FROM products;

-- See what will be deleted (old products)
SELECT id, name, image_url FROM products 
WHERE image_url LIKE '%picsum.photos%';

-- See what will remain (new products)
SELECT id, name, image_url FROM products 
WHERE image_url NOT LIKE '%picsum.photos%';

SELECT id, name, image_url FROM products;

-- delete by specific IDs (replace with actual IDs you see)
DELETE FROM products WHERE id IN (1,2,3,4,5,6,7,8,9,10);

USE jewellery_store;
ALTER TABLE products ADD COLUMN on_sale BOOLEAN DEFAULT FALSE;

DESCRIBE products;

USE jewellery_store;

ALTER TABLE products ADD COLUMN zodiac_sign VARCHAR(20) DEFAULT NULL;

INSERT INTO products (name, category, material, price, description, image_url, stock) VALUES
('Aries Gemstone Bracelet', 'Bracelet', 'Gemstone', 3500, 'Powerful Gemstones bracelet for Aries energy', 'https://gypsy-bazaar.net/wp-content/uploads/2023/03/zodiak-aries-bracelet-on-card-scaled.jpg', 5),
('Taurus Gemstone Bracelet', 'Bracelet', 'Gemstone', 4200, 'powerful gemstones bracelet for Taurus', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-sLQ33qQeeb0F3mpFcovF-wdxNyEeqKZI5Q&s', 4),
('Gemini Gemstone Bracelet', 'Bracelet', 'Gemstone', 2800, 'Powerful gemstones bracelet for Gemini', 'https://gypsy-bazaar.net/wp-content/uploads/2023/05/zodiac-gemini-bracelet-1-scaled.jpg', 6),
('Cancer Gemstone Bracelet', 'Bracelet', 'Gemstone', 4800, 'Powerful gemstones bracelet for Cancer', 'https://gypsy-bazaar.net/wp-content/uploads/2023/11/zodiac-cancer-bracelet-on-card-scaled.jpg', 3),
('Leo Gemstone Bracelet', 'Bracelet', 'Gemstone', 3900, 'Powerful gemstones bracelet for Leo confidence', 'https://gypsy-bazaar.net/wp-content/uploads/2023/11/zodiac-leo-bracelet-on-card-scaled.jpg', 5),
('Virgo Gemstone Bracelet', 'Bracelet', 'Gemstone', 4500, 'Powerful gemstones bracelet for Virgo', 'https://i.etsystatic.com/17828597/r/il/17be87/5392877543/il_fullxfull.5392877543_awd9.jpg', 4),
('Libra Gemstone Bracelet', 'Bracelet', 'Gemstone', 5200, 'Powerful gemstones bracelet for Libra balance', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1vfmxOWXv6ubuC16yqLQPdoYOvW9bAECB8w&s', 3),
('Scorpio Gemstone Bracelet', 'Bracelet', 'Gemstone', 4100, 'Powerful gemstones bracelet for Scorpio intensity', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCEM7PGKEY6y465SJfNzEL7yrYFiKScNJDCw&s', 5),
('Sagittarius Gemstone Bracelet', 'Bracelet', 'Gemstone', 3200, 'Powerful gemstones bracelet for Sagittarius', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRbKMmtH47PSyQHYD0vzIVy5DUrRGypXwL-A&s', 4),
('Capricorn Gemstone Bracelet', 'Bracelet', 'Gemstone', 4600, 'Powerful gemstones bracelet for Capricorn', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlLEzZA0uN0fZUCBadAml5n--kyV_Do63ODw&s', 3),
('Aquarius Gemstone Bracelet', 'Bracelet', 'Gemstone', 3800, 'Powerful gemstones bracelet for Aquarius', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzzbWI-efXbhQs_ObXOdzvfTZNA3GrghYRng&s', 5),
('Pisces Gemstone Bracelet', 'Bracelet', 'Gemstone', 4400, 'Powerful gemstones bracelet for Pisces', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLyz-VAdkFbYaa5U0TyX0YBiRiT6J3-FLIeQ&s', 4);

UPDATE products SET zodiac_sign = 'Aries' WHERE name = 'Aries Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Taurus' WHERE name = 'Taurus Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Gemini' WHERE name = 'Gemini Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Cancer' WHERE name = 'Cancer Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Leo' WHERE name = 'Leo Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Virgo' WHERE name = 'Virgo Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Scorpio' WHERE name = 'Scorpio Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Sagittarius' WHERE name = 'Sagittarius Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Capricorn' WHERE name = 'Capricorn Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Aquarius' WHERE name = 'Aquarius Gemstone Bracelet';
UPDATE products SET zodiac_sign = 'Pisces' WHERE name = 'Pisces Gemstone Bracelet';

-- Step 4: Verify everything worked
SELECT name, zodiac_sign FROM products WHERE zodiac_sign IS NOT NULL;

USE jewellery_store;
SELECT id, name, material FROM products;

USE jewellery_store;
SELECT id, name, material, price FROM products WHERE name LIKE '%Gemstone%' OR name LIKE '%Aries%' OR name LIKE '%Taurus%';

SELECT DISTINCT category FROM products WHERE category IS NOT NULL;

USE jewellery_store;

-- Add role column if not exists
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Create Admin User
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@siddhijewells.com', 'admin123', 'admin');

-- Create Regular User
INSERT INTO users (name, email, password, role) VALUES 
('Regular User', 'user@siddhijewells.com', 'user123', 'user');

-- See all users
SELECT id, name, email, role FROM users;

USE jewellery_store;

-- See what columns you have
SHOW COLUMNS FROM users;

DESCRIBE users;

USE jewellery_store;

SHOW TABLES;

DESCRIBE users;

-- Update admin user role
UPDATE users SET role = 'admin' WHERE email = 'admin@siddhijewells.com';

-- Check all users
SELECT id, name, email, role FROM users;

USE jewellery_store;

-- Check current role for admin user
SELECT id, name, email, role FROM users WHERE email = 'admin@siddhijewells.com';

-- Update role to admin
UPDATE users SET role = 'admin' WHERE email = 'admin@siddhijewells.com';

-- Verify it worked
SELECT id, name, email, role FROM users;

-- Check what role the admin user currently has
SELECT id, name, email, role FROM users WHERE email = 'admin@siddhijewells.com';

CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table if not exists
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

UPDATE users SET verified = TRUE WHERE email = 'admin@siddhijewells.com';

USE jewellery_store;

UPDATE users 
SET password = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    verified = TRUE 
WHERE email = 'admin@siddhijewells.com';

SELECT id, name, email, verified FROM users WHERE email = 'admin@siddhijewells.com';

UPDATE users 
SET password = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'admin@siddhijewells.com';

SELECT id, name, email, password FROM users WHERE email = 'admin@siddhijewells.com';

UPDATE users SET role = 'admin' WHERE email = 'admin2@example.com';

USE jewellery_store;

ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN shipping_address TEXT;
ALTER TABLE orders ADD COLUMN phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);

DESCRIBE orders;

