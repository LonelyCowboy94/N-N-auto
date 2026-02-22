import {
  pgTable,
  text,
  timestamp,
  uuid,
  doublePrecision,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const documentTypeEnum = pgEnum("document_type", [
  "ESTIMATE",
  "WORK_ORDER",
  "INVOICE",
]);

export const shops = pgTable("shops", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  pib: text("pib"),
  maticniBroj: text("maticni_broj"),
  phone: text("phone"),
  emailShop: text("email_shop"),
  logoUrl: text("logo_url"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  shopId: uuid("shop_id").references(() => shops.id),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  verificationToken: text("verification_token"),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  shopId: uuid("shop_id")
    .references(() => shops.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  plateNumber: text("plate_number").notNull(),
  vin: text("vin"),
  year: text("year"),
  displacement: text("displacement"),
  power: text("power"),
  fuelType: text("fuel_type"),
  customerId: uuid("customer_id").references(() => customers.id),
  shopId: uuid("shop_id")
    .references(() => shops.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  category: text("category").default("opšte"),
  shopId: uuid("shop_id")
    .references(() => shops.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: documentTypeEnum("type").notNull(),
  number: text("number").notNull(),
  status: text("status").default("draft"),
  shopId: uuid("shop_id")
    .references(() => shops.id)
    .notNull(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  note: text("note"),
  totalAmount: doublePrecision("total_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentItems = pgTable("document_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").references(() => documents.id, {
    onDelete: "cascade",
  }),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").default(1),
  price: doublePrecision("price").notNull(),
});

export const workOrders = pgTable("work_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  number: text("number").notNull(),
  status: text("status").default("otvoren"),
  dateEntry: timestamp("date_entry").defaultNow(),
  dateExpected: timestamp("date_expected"),
  advisor: text("advisor"),
  note: text("note"),

  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  vehicleId: uuid("vehicle_id")
    .references(() => vehicles.id)
    .notNull(),
  shopId: uuid("shop_id")
    .references(() => shops.id)
    .notNull(),

  totalParts: doublePrecision("total_parts").default(0),
  totalServices: doublePrecision("total_services").default(0),
  totalAmount: doublePrecision("total_amount").default(0),
});

export const workOrderItems = pgTable("work_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  workOrderId: uuid("work_order_id").references(() => workOrders.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  code: text("code"),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  total: doublePrecision("total").notNull(),
});

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [workOrders.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [workOrders.vehicleId],
    references: [vehicles.id],
  }),
}));

export const workOrderItemsRelations = relations(workOrderItems, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderItems.workOrderId],
    references: [workOrders.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  workOrders: many(workOrders),
}));
