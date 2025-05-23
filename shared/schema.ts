import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User and Auth schemas
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'admin', 'doctor', 'nurse', 'staff'
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employeeRoleEnum = pgEnum('employee_role', ['doctor', 'nurse', 'administrative']);

// UBS schema
export const ubs = pgTable("ubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code"),
  phone: text("phone"),
  email: text("email"),
  district: text("district"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee schema
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: employeeRoleEnum("role").notNull(),
  specialty: text("specialty"),
  licenseNumber: text("license_number"),
  ubsId: integer("ubs_id").references(() => ubs.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Disease schema
export const diseases = pgTable("diseases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  icd10Code: text("icd10_code"), // International Classification of Diseases code
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical Record schema
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientName: text("patient_name").notNull(),
  patientBirthDate: timestamp("patient_birth_date").notNull(),
  diseaseId: integer("disease_id").references(() => diseases.id),
  ubsId: integer("ubs_id").references(() => ubs.id),
  employeeId: integer("employee_id").references(() => employees.id),
  data: json("data").notNull(), // This will store the complex nested JSON structure
  status: text("status").notNull(), // 'active', 'completed', 'critical', 'follow-up'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertUbsSchema = createInsertSchema(ubs).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertDiseaseSchema = createInsertSchema(diseases).omit({
  id: true,
  createdAt: true,
});

export const sifilesCongenitaSchema = z.object({
  monitoramento_sifilis_congenita: z.object({
    matricula: z.string(),
    data: z.date(),
    nome: z.string(),
    data_nascimento: z.date(),
    encaminhado_por: z.string(),
  }),
  historia_materna: z.object({
    nome_mae: z.string(),
    idade: z.number(),
    anos_pre_natal_ubs: z.string(),
    numero_consultas: z.number(),
    tratamento: z.string(),
    tratou_parceiro: z.string(),
    observacoes: z.string(),
  }),
  historico_hospitalar: z.object({
    local_nascimento: z.string(),
    tipo_parto: z.string(),
    idade_gestacional: z.string(),
    semanas_apgar: z.string(),
    teste_sorologico: z.string(),
    tratamento: z.string(),
    exames_radiologicos: z.string(),
    liquor: z.string(),
  }),
  triagem_neonatal: z.object({
    reflexo_vermelho: z.object({
      olho_direito: z.string(),
      olho_esquerdo: z.string(),
    }),
    triagem_auditiva: z.object({
      emissao_otoacustica_evocada: z.string(),
      potencial_evocado_auditivo_tronco: z.string(),
      ouvido_direito: z.string(),
      ouvido_esquerdo: z.string(),
    }),
    oximetria_pulso: z.object({
      msd: z.string(),
      mid: z.string(),
    }),
    teste_linguinha: z.string(),
    observacoes: z.string(),
  }),
  acompanhamento_ambulatorio_alto_risco: z.object({
    data_primeira_consulta: z.date(),
    exame_sorologia: z.string(),
    primeiro_mes: z.object({
      data: z.date(),
      resultado: z.string(),
      tratamento: z.string(),
    }),
    terceiro_mes: z.object({
      data: z.date(),
      resultado: z.string(),
      tratamento: z.string(),
    }),
    sexto_mes: z.object({
      data: z.date(),
      resultado: z.string(),
      tratamento: z.string(),
    }),
    decimo_oito_mes: z.object({
      data: z.date(),
      resultado: z.string(),
      tratamento: z.string(),
    }),
    liquor_alterado: z.string(),
    acompanhamentos: z.object({
      oftalmologico: z.boolean(),
      neurologico: z.boolean(),
      audiologico: z.boolean(),
      outros: z.string(),
    }),
    observacoes: z.string(),
    alta_ambulatorio_alto_risco: z.string(),
    ubs_referencia: z.string(),
  }),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    data: sifilesCongenitaSchema,
  });

// Define select types
export type User = typeof users.$inferSelect;
export type Ubs = typeof ubs.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type Disease = typeof diseases.$inferSelect;
export type MedicalRecord = typeof medicalRecords.$inferSelect;

// Define insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUbs = z.infer<typeof insertUbsSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
