import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertEmployeeSchema, employeeRoleEnum, type Employee, type InsertEmployee } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

type EmployeeFormValues = z.infer<typeof insertEmployeeSchema>;

interface EmployeeFormProps {
  employeeId?: number;
  isEdit?: boolean;
  onComplete?: () => void;
}

export function EmployeeForm({ employeeId, isEdit = false, onComplete }: EmployeeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(isEdit);

  const employeeFormSchema = insertEmployeeSchema.extend({
    password: isEdit 
      ? z.string().optional() 
      : z.string().min(6, {
          message: "A senha deve ter pelo menos 6 caracteres",
        }),
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "doctor",
      ubsId: undefined,
      isActive: true,
      password: "",
      phone: "",
      specialty: "",
      registrationNumber: "",
    },
  });

  const { data: employee } = useQuery<Employee>({
    queryKey: ["/api/employees", employeeId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isEdit && !!employeeId,
  });

  const { data: ubsList } = useQuery({
    queryKey: ["/api/ubs"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    if (employee && isEdit) {
      form.reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || "",
        role: employee.role,
        specialty: employee.specialty || "",
        registrationNumber: employee.registrationNumber || "",
        ubsId: employee.ubsId,
        isActive: employee.isActive,
        password: "", //Senha não defiida
      });
      setLoading(false);
    }
  }, [employee, form, isEdit]);

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      const res = await apiRequest("POST", "/api/employees", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Funcionário criado",
        description: "O funcionário foi criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar funcionário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      const res = await apiRequest("PATCH", `/api/employees/${employeeId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Funcionário atualizado",
        description: "O funcionário foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar funcionário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    // Remove empty password field from update if not provided
    if (isEdit && (!data.password || data.password.trim() === "")) {
      const { password, ...dataWithoutPassword } = data;
      updateEmployeeMutation.mutate(dataWithoutPassword as EmployeeFormValues);
    } else {
      if (isEdit) {
        updateEmployeeMutation.mutate(data);
      } else {
        createEmployeeMutation.mutate(data);
      }
    }
  };

  const isPending = createEmployeeMutation.isPending || updateEmployeeMutation.isPending;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Editar Funcionário" : "Novo Funcionário"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do funcionário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="doctor">Médico</SelectItem>
                        <SelectItem value="nurse">Enfermeiro</SelectItem>
                        <SelectItem value="administrative">Administrativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Cardiologia, Pediatria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Registro</FormLabel>
                    <FormControl>
                      <Input placeholder="CRM/COREN/Outro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ubsId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UBS de Trabalho</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value?.toString()}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma UBS" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ubsList?.map((ubs) => (
                          <SelectItem key={ubs.id} value={ubs.id.toString()}>
                            {ubs.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEdit ? "Nova Senha (opcional)" : "Senha"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={isEdit ? "Deixe em branco para manter" : "Senha"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Funcionário ativo?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onComplete}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Atualizar" : "Cadastrar"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

// Helper function - normally would be imported from queryClient.ts
function getQueryFn({ on401 }: { on401: "throw" | "returnNull" }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const [endpoint, ...rest] = queryKey;
    const url = rest.length > 0 ? `${endpoint}/${rest.join("/")}` : endpoint;
    
    const res = await fetch(url);
    
    if (res.status === 401) {
      if (on401 === "throw") {
        throw new Error("Não autorizado");
      }
      return null;
    }
    
    if (!res.ok) {
      throw new Error(`Erro ao carregar dados: ${res.status}`);
    }
    
    return res.json();
  };
}