import { 
  users, type User, type InsertUser, 
  ubs, type Ubs, type InsertUbs,
  employees, type Employee, type InsertEmployee,
  diseases, type Disease, type InsertDisease,
  medicalRecords, type MedicalRecord, type InsertMedicalRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";


const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // UBS operations
  getAllUbs(): Promise<Ubs[]>;
  getUbs(id: number): Promise<Ubs | undefined>;
  createUbs(ubs: InsertUbs): Promise<Ubs>;
  updateUbs(id: number, data: Partial<InsertUbs>): Promise<Ubs | undefined>;
  deleteUbs(id: number): Promise<boolean>;

  // Employee operations
  getAllEmployees(): Promise<Employee[]>;
  getEmployeesByUbs(ubsId: number): Promise<Employee[]>;
  getEmployeesByRole(role: string): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Disease operations
  getAllDiseases(): Promise<Disease[]>;
  getDisease(id: number): Promise<Disease | undefined>;
  createDisease(disease: InsertDisease): Promise<Disease>;
  updateDisease(id: number, data: Partial<InsertDisease>): Promise<Disease | undefined>;
  deleteDisease(id: number): Promise<boolean>;

  // Medical Record operations
  getAllMedicalRecords(): Promise<MedicalRecord[]>;
  getMedicalRecordsByUbs(ubsId: number): Promise<MedicalRecord[]>;
  getMedicalRecordsByDisease(diseaseId: number): Promise<MedicalRecord[]>;
  getMedicalRecord(id: number): Promise<MedicalRecord | undefined>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined>;
  deleteMedicalRecord(id: number): Promise<boolean>;

  // Statistics
  getStatistics(): Promise<any>;

  // Session store
  sessionStore: session.SessionStore;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  // UBS operations
  async getAllUbs(): Promise<Ubs[]> {
    return await db.select().from(ubs).orderBy(ubs.name);
  }

  async getUbs(id: number): Promise<Ubs | undefined> {
    const [ubsItem] = await db.select().from(ubs).where(eq(ubs.id, id));
    return ubsItem;
  }

  async createUbs(ubsData: InsertUbs): Promise<Ubs> {
    const [createdUbs] = await db.insert(ubs).values(ubsData).returning();
    return createdUbs;
  }

  async updateUbs(id: number, data: Partial<InsertUbs>): Promise<Ubs | undefined> {
    const [updatedUbs] = await db
      .update(ubs)
      .set(data)
      .where(eq(ubs.id, id))
      .returning();
    return updatedUbs;
  }

  async deleteUbs(id: number): Promise<boolean> {
    const result = await db.delete(ubs).where(eq(ubs.id, id));
    return true; // If no error was thrown, deletion was successful
  }

  // Employee operations
  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(employees.name);
  }

  async getEmployeesByUbs(ubsId: number): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.ubsId, ubsId));
  }

  async getEmployeesByRole(role: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.role, role as any));
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [createdEmployee] = await db.insert(employees).values(employee).returning();
    return createdEmployee;
  }

  async updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(data)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    await db.delete(employees).where(eq(employees.id, id));
    return true;
  }

  // Disease operations
  async getAllDiseases(): Promise<Disease[]> {
    return await db.select().from(diseases).orderBy(diseases.name);
  }

  async getDisease(id: number): Promise<Disease | undefined> {
    const [disease] = await db.select().from(diseases).where(eq(diseases.id, id));
    return disease;
  }

  async createDisease(disease: InsertDisease): Promise<Disease> {
    const [createdDisease] = await db.insert(diseases).values(disease).returning();
    return createdDisease;
  }

  async updateDisease(id: number, data: Partial<InsertDisease>): Promise<Disease | undefined> {
    const [updatedDisease] = await db
      .update(diseases)
      .set(data)
      .where(eq(diseases.id, id))
      .returning();
    return updatedDisease;
  }

  async deleteDisease(id: number): Promise<boolean> {
    await db.delete(diseases).where(eq(diseases.id, id));
    return true;
  }

  // Medical Record operations
  async getAllMedicalRecords(): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).orderBy(desc(medicalRecords.createdAt));
  }

  async getMedicalRecordsByUbs(ubsId: number): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.ubsId, ubsId));
  }

  async getMedicalRecordsByDisease(diseaseId: number): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.diseaseId, diseaseId));
  }

  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    const [record] = await db.select().from(medicalRecords).where(eq(medicalRecords.id, id));
    return record;
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [createdRecord] = await db.insert(medicalRecords).values(record).returning();
    return createdRecord;
  }

  async updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const [updatedRecord] = await db
      .update(medicalRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(medicalRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async deleteMedicalRecord(id: number): Promise<boolean> {
    await db.delete(medicalRecords).where(eq(medicalRecords.id, id));
    return true;
  }

  // Statistics
  async getStatistics(): Promise<any> {
    const ubsCount = await db.select({ count: ubs.id }).from(ubs);
    const doctorCount = await db.select({ count: employees.id }).from(employees).where(eq(employees.role, 'doctor'));
    const recordCount = await db.select({ count: medicalRecords.id }).from(medicalRecords);
    const activeRecordCount = await db.select({ count: medicalRecords.id }).from(medicalRecords).where(eq(medicalRecords.status, 'active'));

    return {
      ubsCount: ubsCount[0]?.count || 0,
      doctorCount: doctorCount[0]?.count || 0,
      recordCount: recordCount[0]?.count || 0,
      activeRecordCount: activeRecordCount[0]?.count || 0
    };
  }
}

// In memory implementation for fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ubsList: Map<number, Ubs>;
  private employeesList: Map<number, Employee>;
  private diseasesList: Map<number, Disease>;
  private medicalRecordsList: Map<number, MedicalRecord>;
  private currentId: Record<string, number>;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.ubsList = new Map();
    this.employeesList = new Map();
    this.diseasesList = new Map();
    this.medicalRecordsList = new Map();
    this.currentId = {
      users: 1,
      ubs: 1,
      employees: 1,
      diseases: 1,
      medicalRecords: 1
    };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // UBS operations
  async getAllUbs(): Promise<Ubs[]> {
    return Array.from(this.ubsList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getUbs(id: number): Promise<Ubs | undefined> {
    return this.ubsList.get(id);
  }

  async createUbs(ubs: InsertUbs): Promise<Ubs> {
    const id = this.currentId.ubs++;
    const newUbs: Ubs = { ...ubs, id, createdAt: new Date() };
    this.ubsList.set(id, newUbs);
    return newUbs;
  }

  async updateUbs(id: number, data: Partial<InsertUbs>): Promise<Ubs | undefined> {
    const ubs = this.ubsList.get(id);
    if (!ubs) return undefined;
    
    const updatedUbs = { ...ubs, ...data };
    this.ubsList.set(id, updatedUbs);
    return updatedUbs;
  }

  async deleteUbs(id: number): Promise<boolean> {
    return this.ubsList.delete(id);
  }

  // Employee operations
  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employeesList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getEmployeesByUbs(ubsId: number): Promise<Employee[]> {
    return Array.from(this.employeesList.values()).filter(emp => emp.ubsId === ubsId);
  }

  async getEmployeesByRole(role: string): Promise<Employee[]> {
    return Array.from(this.employeesList.values()).filter(emp => emp.role === role);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employeesList.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentId.employees++;
    const newEmployee: Employee = { ...employee, id, createdAt: new Date() };
    this.employeesList.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employeesList.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...data };
    this.employeesList.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employeesList.delete(id);
  }

  // Disease operations
  async getAllDiseases(): Promise<Disease[]> {
    return Array.from(this.diseasesList.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getDisease(id: number): Promise<Disease | undefined> {
    return this.diseasesList.get(id);
  }

  async createDisease(disease: InsertDisease): Promise<Disease> {
    const id = this.currentId.diseases++;
    const newDisease: Disease = { ...disease, id, createdAt: new Date() };
    this.diseasesList.set(id, newDisease);
    return newDisease;
  }

  async updateDisease(id: number, data: Partial<InsertDisease>): Promise<Disease | undefined> {
    const disease = this.diseasesList.get(id);
    if (!disease) return undefined;
    
    const updatedDisease = { ...disease, ...data };
    this.diseasesList.set(id, updatedDisease);
    return updatedDisease;
  }

  async deleteDisease(id: number): Promise<boolean> {
    return this.diseasesList.delete(id);
  }

  // Medical Record operations
  async getAllMedicalRecords(): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecordsList.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMedicalRecordsByUbs(ubsId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecordsList.values())
      .filter(record => record.ubsId === ubsId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMedicalRecordsByDisease(diseaseId: number): Promise<MedicalRecord[]> {
    return Array.from(this.medicalRecordsList.values())
      .filter(record => record.diseaseId === diseaseId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMedicalRecord(id: number): Promise<MedicalRecord | undefined> {
    return this.medicalRecordsList.get(id);
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const id = this.currentId.medicalRecords++;
    const now = new Date();
    const newRecord: MedicalRecord = { 
      ...record, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.medicalRecordsList.set(id, newRecord);
    return newRecord;
  }

  async updateMedicalRecord(id: number, data: Partial<InsertMedicalRecord>): Promise<MedicalRecord | undefined> {
    const record = this.medicalRecordsList.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { 
      ...record, 
      ...data,
      updatedAt: new Date()
    };
    this.medicalRecordsList.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteMedicalRecord(id: number): Promise<boolean> {
    return this.medicalRecordsList.delete(id);
  }

  // Statistics
  async getStatistics(): Promise<any> {
    const ubsCount = this.ubsList.size;
    const doctorCount = Array.from(this.employeesList.values()).filter(emp => emp.role === 'doctor').length;
    const recordCount = this.medicalRecordsList.size;
    const activeRecordCount = Array.from(this.medicalRecordsList.values()).filter(rec => rec.status === 'active').length;

    return {
      ubsCount,
      doctorCount,
      recordCount,
      activeRecordCount
    };
  }
}

// Choose which implementation to use
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
