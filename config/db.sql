CREATE DATABASE lost_and_found_db;
USE lost_and_found_db;

CREATE TABLE categories (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('admin','staff','student') NOT NULL,
  phone      VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE found_items (
  item_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  item_name     VARCHAR(100) NOT NULL,
  description   TEXT,
  location_found VARCHAR(100),
  date_found    DATE,
  found_status  ENUM('unclaimed','pending','claimed') DEFAULT 'unclaimed',
  category_id   INT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)      REFERENCES users(user_id),
  FOREIGN KEY (category_id)  REFERENCES categories(category_id)
);

CREATE TABLE lost_reports (
  report_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  item_name     VARCHAR(100) NOT NULL,
  description   TEXT,
  location_lost VARCHAR(100),
  date_lost     DATE,
  lost_status   ENUM('searching','found','closed') DEFAULT 'searching',
  category_id   INT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE claims (
  claim_id          INT AUTO_INCREMENT PRIMARY KEY,
  item_id           INT NOT NULL,
  user_id           INT NOT NULL,
  reviewed_by       INT,
  ownership_proof   TEXT,
  identifying_details TEXT,
  claim_status      ENUM('pending','approved','rejected') DEFAULT 'pending',
  review_note       TEXT,
  submitted_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at       DATETIME,
  FOREIGN KEY (item_id)     REFERENCES found_items(item_id),
  FOREIGN KEY (user_id)     REFERENCES users(user_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

INSERT INTO categories (category_name) VALUES
('Electronics'), ('Clothing'), ('Accessories'),
('Books & Stationery'), ('Keys'), ('Wallet & Cards'),
('Water Bottle'), ('Bag'), ('Others');

INSERT INTO users (name, email, password, role, phone) VALUES
('Admin UTM',   'admin@utm.my',    MD5('admin123'),   'admin',   '0112345678'),
('Puan Siti',   'siti@utm.my',     MD5('staff123'),   'staff',   '0123456789'),
('Ahmad Faris', 'ahmad@utm.my',    MD5('student123'), 'user', '0134567890');