import 'dotenv/config';

import { db } from "./server/db.js";
import { users } from "./shared/schema.js";
import { hashPassword } from "./server/auth.js";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  try {
    // Verificar se já existe um usuário admin
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"));

    if (existingAdmin) {
      console.log("Usuário admin já existe");
      return;
    }

    // Criar um usuário administrativo
    const hashedPassword = await hashPassword("admin123");
    
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        name: "Administrador",
        role: "admin",
        email: "admin@ubsmanager.com",
        phone: "(11) 99999-9999",
      })
      .returning();

    console.log("Usuário administrador criado com sucesso:");
    console.log(`Username: admin`);
    console.log(`Password: admin123`);
    
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
    process.exit(1);
  }
}

createAdminUser();