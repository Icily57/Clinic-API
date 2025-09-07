// src/schema.ts
import {pgTable,serial,varchar,text,timestamp,integer,boolean,numeric,jsonb,pgEnum} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =============================
// Enums
// =============================
export const roleEnum = pgEnum("user_type", ["Admin", "Doctor", "Staff", "Patient"]);

// =============================
// Users & Auth
// =============================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 120 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  role: roleEnum("role").default("Patient").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================
// Patients (Profile Extensions)
// =============================
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(), // link to users(role=Patient)
  dob: timestamp("dob"),
  gender: varchar("gender", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  insurance: varchar("insurance", { length: 120 }),
  emergencyContact: varchar("emergency_contact", { length: 120 }),
});

// =============================
// Doctors (Profile Extensions)
// =============================
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(), // link to users(role=Doctor)
  specialization: varchar("specialization", { length: 120 }),
  licenseNumber: varchar("license_number", { length: 50 }).unique(),
});

// =============================
// Appointments
// =============================
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  date: timestamp("date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================
// Payments
// =============================
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }).notNull(), // Mpesa, Cash, Insurance, etc.
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  transactionRef: varchar("transaction_ref", { length: 120 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =============================
// Relations
// =============================
export const usersRelations = relations(users, ({ one }) => ({
  patient: one(patients, { fields: [users.id], references: [patients.userId] }),
  doctor: one(doctors, { fields: [users.id], references: [doctors.userId] }),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  appointments: many(appointments),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  appointment: one(appointments, { fields: [payments.appointmentId], references: [appointments.id] }),
}));
