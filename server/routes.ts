import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertUbsSchema, insertEmployeeSchema, insertDiseaseSchema, insertMedicalRecordSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Get middleware from app.locals
  const { checkRole } = app.locals;

  // Statistics route
  app.get("/api/statistics", async (req, res, next) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // UBS routes
  app.get("/api/ubs", async (req, res, next) => {
    try {
      const ubsList = await storage.getAllUbs();
      res.json(ubsList);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/ubs/:id", async (req, res, next) => {
    try {
      const ubs = await storage.getUbs(Number(req.params.id));
      if (!ubs) {
        return res.status(404).json({ message: "UBS not found" });
      }
      res.json(ubs);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ubs", checkRole(["admin"]), async (req, res, next) => {
    try {
      const parseResult = insertUbsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const newUbs = await storage.createUbs(parseResult.data);
      res.status(201).json(newUbs);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/ubs/:id", checkRole(["admin"]), async (req, res, next) => {
    try {
      const parseResult = insertUbsSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const updatedUbs = await storage.updateUbs(Number(req.params.id), parseResult.data);
      if (!updatedUbs) {
        return res.status(404).json({ message: "UBS not found" });
      }
      res.json(updatedUbs);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/ubs/:id", checkRole(["admin"]), async (req, res, next) => {
    try {
      const success = await storage.deleteUbs(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "UBS not found" });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Employee routes
  app.get("/api/employees", async (req, res, next) => {
    try {
      const { ubsId, role } = req.query;
      
      let employees;
      if (ubsId) {
        employees = await storage.getEmployeesByUbs(Number(ubsId));
      } else if (role) {
        employees = await storage.getEmployeesByRole(role as string);
      } else {
        employees = await storage.getAllEmployees();
      }
      
      res.json(employees);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/employees/:id", async (req, res, next) => {
    try {
      const employee = await storage.getEmployee(Number(req.params.id));
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/employees", checkRole(["admin"]), async (req, res, next) => {
    try {
      const parseResult = insertEmployeeSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const newEmployee = await storage.createEmployee(parseResult.data);
      res.status(201).json(newEmployee);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/employees/:id", checkRole(["admin"]), async (req, res, next) => {
    try {
      const parseResult = insertEmployeeSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const updatedEmployee = await storage.updateEmployee(Number(req.params.id), parseResult.data);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/employees/:id", checkRole(["admin"]), async (req, res, next) => {
    try {
      const success = await storage.deleteEmployee(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Disease routes
  app.get("/api/diseases", async (req, res, next) => {
    try {
      const diseases = await storage.getAllDiseases();
      res.json(diseases);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/diseases/:id", async (req, res, next) => {
    try {
      const disease = await storage.getDisease(Number(req.params.id));
      if (!disease) {
        return res.status(404).json({ message: "Disease not found" });
      }
      res.json(disease);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/diseases", checkRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const parseResult = insertDiseaseSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const newDisease = await storage.createDisease(parseResult.data);
      res.status(201).json(newDisease);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/diseases/:id", checkRole(["admin", "doctor"]), async (req, res, next) => {
    try {
      const parseResult = insertDiseaseSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const updatedDisease = await storage.updateDisease(Number(req.params.id), parseResult.data);
      if (!updatedDisease) {
        return res.status(404).json({ message: "Disease not found" });
      }
      res.json(updatedDisease);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/diseases/:id", checkRole(["admin"]), async (req, res, next) => {
    try {
      const success = await storage.deleteDisease(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Disease not found" });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Medical Record routes
  app.get("/api/medical-records", async (req, res, next) => {
    try {
      const { ubsId, diseaseId } = req.query;
      
      let records;
      if (ubsId) {
        records = await storage.getMedicalRecordsByUbs(Number(ubsId));
      } else if (diseaseId) {
        records = await storage.getMedicalRecordsByDisease(Number(diseaseId));
      } else {
        records = await storage.getAllMedicalRecords();
      }
      
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/medical-records/:id", async (req, res, next) => {
    try {
      const record = await storage.getMedicalRecord(Number(req.params.id));
      if (!record) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/medical-records", checkRole(["admin", "doctor", "nurse"]), async (req, res, next) => {
    try {
      const parseResult = insertMedicalRecordSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const newRecord = await storage.createMedicalRecord(parseResult.data);
      res.status(201).json(newRecord);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/medical-records/:id", checkRole(["admin", "doctor", "nurse"]), async (req, res, next) => {
    try {
      const parseResult = insertMedicalRecordSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid data", errors: parseResult.error.flatten() });
      }
      
      const updatedRecord = await storage.updateMedicalRecord(Number(req.params.id), parseResult.data);
      if (!updatedRecord) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.json(updatedRecord);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/medical-records/:id", checkRole(["admin"]), async (req, res, next) => {
    try {
      const success = await storage.deleteMedicalRecord(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Medical record not found" });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
