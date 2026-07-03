import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  numeric,
  date,
  time,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Tipovi korisnika - client (klijent), employee (frizer), admin (administrator salona)
export const userRoleEnum = pgEnum("user_role", ["client", "employee", "admin"]);

// Status zakazanog termina
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

// Korisnici
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passHash: varchar("pass_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: userRoleEnum("role").notNull().default("client"),
  profileImage: varchar("profile_image", { length: 500 }), // ← DODAJ OVO
  createdAt: timestamp("created_at").defaultNow(),
});

// Kategorije usluga - grupe i podgrupe (Feniranje, Farbanje, Tretmani, Frizure...)
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  parentId: uuid("parent_id").references((): any => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Usluge
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  description: varchar("description", { length: 1000 }), // ← bilo je text()
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  image: varchar("image", { length: 500 }),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Frizeri - povezani sa korisničkim nalogom (role = employee)
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  specialization: varchar("specialization", { length: 255 }),
  bio: text("bio"),
  avatarUrl: varchar("avatar_url", { length: 500 }), // ← DODAJ OVO
  createdAt: timestamp("created_at").defaultNow(),
});

// Zakazani termini
export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  employeeId: uuid("employee_id")
    .references(() => employees.id)
    .notNull(),
  serviceId: uuid("service_id")
    .references(() => services.id)
    .notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});
