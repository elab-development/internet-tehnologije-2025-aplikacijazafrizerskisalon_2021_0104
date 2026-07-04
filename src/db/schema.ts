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


export const userRoleEnum = pgEnum("user_role", ["client", "employee", "admin"]);


export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);


export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passHash: varchar("pass_hash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  role: userRoleEnum("role").notNull().default("client"),
  profileImage: varchar("profile_image", { length: 500 }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull().unique(),
  parentId: uuid("parent_id").references((): any => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
});


export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  image: varchar("image", { length: 500 }),
  categoryId: uuid("category_id")
    .references(() => categories.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  specialization: varchar("specialization", { length: 255 }),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});


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
