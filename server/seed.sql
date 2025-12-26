-- Categories
INSERT INTO test_categories (name, slug) VALUES
('Hematology', 'hematology'),
('Cardiac', 'cardiac'),
('Diabetes', 'diabetes'),
('Endocrine', 'endocrine'),
('Vitamins', 'vitamins'),
('Biochemistry', 'biochemistry'),
('Inflammation', 'inflammation')
ON CONFLICT DO NOTHING;

-- Tests
INSERT INTO tests (name, category_id, description, price, fasting, sample) VALUES
('Complete Blood Count (CBC)', (SELECT id FROM test_categories WHERE slug='hematology'), 'Measures blood cells', 12.50, false, 'Blood'),
('Lipid Profile', (SELECT id FROM test_categories WHERE slug='cardiac'), 'Cholesterol & triglycerides', 25.00, true, 'Blood'),
('Blood Sugar (FBS)', (SELECT id FROM test_categories WHERE slug='diabetes'), 'Fasting blood glucose', 8.00, true, 'Blood'),
('Thyroid Panel (T3/T4/TSH)', (SELECT id FROM test_categories WHERE slug='endocrine'), 'Thyroid hormones', 30.00, false, 'Blood'),
('Vitamin D', (SELECT id FROM test_categories WHERE slug='vitamins'), 'Vitamin D level', 22.00, false, 'Blood'),
('HbA1c', (SELECT id FROM test_categories WHERE slug='diabetes'), '3-month average blood sugar', 18.00, false, 'Blood'),
('Liver Function Test (LFT)', (SELECT id FROM test_categories WHERE slug='biochemistry'), 'Liver enzymes', 28.00, true, 'Blood'),
('Renal Function Test (RFT)', (SELECT id FROM test_categories WHERE slug='biochemistry'), 'Kidney function', 26.00, false, 'Blood'),
('Iron Studies', (SELECT id FROM test_categories WHERE slug='hematology'), 'Iron, ferritin', 20.00, false, 'Blood'),
('CRP', (SELECT id FROM test_categories WHERE slug='inflammation'), 'C-reactive protein', 15.00, false, 'Blood')
ON CONFLICT DO NOTHING;

-- Admin user
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@lab.com', '$2a$10$9b7uWQxM3U8Jv3W7yJH1gu3Q3o3Jwqf3yHkRjPp0YlVb1EwZQfQ6W', 'admin')
ON CONFLICT DO NOTHING;

-- Banners
INSERT INTO banners (title, subtitle, image_url, package_slug) VALUES
('Home Sample Collection', 'We collect samples at your home', '/assets/banner1.svg', 'hematology'),
('Fast Digital Reports', 'View results online within 24-48 hours', '/assets/banner2.svg', 'cardiac'),
('Diabetes Testing', 'Comprehensive diabetes screening packages', '/assets/banner3.svg', 'diabetes'),
('Thyroid Panel', 'Complete thyroid health evaluation', '/assets/banner4.svg', 'endocrine')
ON CONFLICT DO NOTHING;
