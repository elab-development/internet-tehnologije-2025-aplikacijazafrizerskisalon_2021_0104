-- Pokreni ovaj SQL u pgAdmin Query Tool za bazu bibi_salon2
-- Tools -> Query Tool -> nalepi sve -> klikni Play (▶)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('client', 'employee', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  pass_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  image VARCHAR(500),
  category_id UUID NOT NULL REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  specialization VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  service_id UUID NOT NULL REFERENCES services(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Unique constraint - sprecava race condition (dva korisnika ne mogu zakazati isti slot)
  CONSTRAINT unique_employee_slot UNIQUE (employee_id, date, time)
);
