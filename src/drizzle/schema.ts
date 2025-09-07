import { 
  pgTable, 
  pgEnum, 
  serial, 
  varchar, 
  integer, 
  text, 
  timestamp, 
  decimal 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =======================
// ENUMS
// =======================

// Roles (system users only)
export const roleEnum = pgEnum("role", ["admin", "doctor", "staff"]);

// =======================
// USERS (system accounts)
// =======================
export const UsersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  contact_phone: varchar("contact_phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  role: roleEnum("role").notNull().default("staff"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =======================
// PATIENTS
// =======================
export const PatientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  contact_phone: varchar("contact_phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  dob: timestamp("dob"), // date of birth
  gender: varchar("gender", { length: 10 }),
  created_at: timestamp("created_at").defaultNow(),
});

// =======================
// APPOINTMENTS
// =======================
export const AppointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").references(() => PatientsTable.id).notNull(),
  doctor_id: integer("doctor_id").references(() => UsersTable.id).notNull(),
  appointment_date: timestamp("appointment_date").notNull(),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, completed, cancelled
  created_at: timestamp("created_at").defaultNow(),
});

// =======================
// MEDICAL RECORDS
// =======================
export const MedicalRecordsTable = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").references(() => PatientsTable.id).notNull(),
  doctor_id: integer("doctor_id").references(() => UsersTable.id).notNull(),
  diagnosis: text("diagnosis").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// =======================
// PRESCRIPTIONS
// =======================
export const PrescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").references(() => PatientsTable.id).notNull(),
  doctor_id: integer("doctor_id").references(() => UsersTable.id).notNull(),
  medication: varchar("medication", { length: 255 }).notNull(),
  dosage: varchar("dosage", { length: 100 }),
  instructions: text("instructions"),
  created_at: timestamp("created_at").defaultNow(),
});

// =======================
// INVOICES
// =======================
export const InvoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").references(() => PatientsTable.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("unpaid"), // unpaid, paid, pending
  created_at: timestamp("created_at").defaultNow(),
});

// =======================
// PAYMENTS
// =======================
export const PaymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoice_id: integer("invoice_id").references(() => InvoicesTable.id).notNull(),
  amount_paid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  payment_date: timestamp("payment_date").defaultNow(),
  method: varchar("method", { length: 50 }), // cash, mpesa, card, insurance
});

// =======================
// INVENTORY (Optional)
// =======================
export const InventoryTable = pgTable("inventory", {
  id: serial("id").primaryKey(),
  item_name: varchar("item_name", { length: 255 }).notNull(),
  description: text("description"),
  quantity: integer("quantity").default(0),
  unit_price: decimal("unit_price", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
});

// =======================
// NOTIFICATIONS (Optional)
// =======================
export const NotificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => UsersTable.id),
  patient_id: integer("patient_id").references(() => PatientsTable.id),
  message: text("message").notNull(),
  is_read: integer("is_read").default(0), // 0 = unread, 1 = read
  created_at: timestamp("created_at").defaultNow(),
});


// Relations
export const userRelations = relations(UsersTable, ({ many }) => ({
  appointments: many(AppointmentsTable),
  medicalRecords: many(MedicalRecordsTable),
  prescriptions: many(PrescriptionsTable),
  invoices: many(InvoicesTable),
  payments: many(PaymentsTable),
  notifications: many(NotificationsTable),
}));

export const patientRelations = relations(PatientsTable, ({ many }) => ({
  appointments: many(AppointmentsTable),
  medicalRecords: many(MedicalRecordsTable),
  prescriptions: many(PrescriptionsTable),
  invoices: many(InvoicesTable),
  payments: many(PaymentsTable),
  notifications: many(NotificationsTable),
}));

export const appointmentRelations = relations(AppointmentsTable, ({ one }) => ({
  patient: one(PatientsTable),
  doctor: one(UsersTable),
}));

export const medicalRecordRelations = relations(MedicalRecordsTable, ({ one }) => ({
  patient: one(PatientsTable),
  doctor: one(UsersTable),
}));

export const prescriptionRelations = relations(PrescriptionsTable, ({ one }) => ({
  patient: one(PatientsTable),
  doctor: one(UsersTable),
}));

export const invoiceRelations = relations(InvoicesTable, ({ one }) => ({
  patient: one(PatientsTable),
}));

export const paymentRelations = relations(PaymentsTable, ({ one }) => ({
  invoice: one(InvoicesTable),
}));

// export const inventoryRelations = relations(InventoryTable, ({ one }) => ({
//   item: one(ItemsTable),
// }));

export const notificationRelations = relations(NotificationsTable, ({ one }) => ({
  user: one(UsersTable),
  patient: one(PatientsTable),
}));

export type TIUser = typeof UsersTable.$inferInsert
export type TSUser = typeof UsersTable.$inferSelect

export type TIAppointment = typeof AppointmentsTable.$inferInsert
export type TSAppointment = typeof AppointmentsTable.$inferSelect

export type TIPatient = typeof PatientsTable.$inferInsert
export type TSPatient = typeof PatientsTable.$inferSelect

export type TIMedicalRecord = typeof MedicalRecordsTable.$inferInsert
export type TSMedicalRecord = typeof MedicalRecordsTable.$inferSelect

export type TIPrescription = typeof PrescriptionsTable.$inferInsert
export type TSPrescription = typeof PrescriptionsTable.$inferSelect

export type TIInvoice = typeof InvoicesTable.$inferInsert
export type TSInvoice = typeof InvoicesTable.$inferSelect

export type TIPayment = typeof PaymentsTable.$inferInsert
export type TSPayment = typeof PaymentsTable.$inferSelect

export type TIInventory = typeof InventoryTable.$inferInsert
export type TSInventory = typeof InventoryTable.$inferSelect

export type TINotification = typeof NotificationsTable.$inferInsert
export type TSNotification = typeof NotificationsTable.$inferSelect