import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertDiseaseSchema, type Disease, type InsertDisease } from "@shared/schema";

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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type DiseaseFormValues = z.infer<typeof insertDiseaseSchema>;

interface DiseaseFormProps {
  diseaseId?: number;
  isEdit?: boolean;
  onComplete?: () => void;
}

export function DiseaseForm({ diseaseId, isEdit = false, onComplete }: DiseaseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(isEdit);

  const diseaseFormSchema = insertDiseaseSchema;

  const form = useForm<DiseaseFormValues>({
    resolver: zodResolver(diseaseFormSchema),
    defaultValues: {
      name: "",
      icd10Code: "",
      description: "",
      treatmentInfo: "",
      symptoms: "",
      preventionInfo: "",
    },
  });

  const { data: disease } = useQuery<Disease>({
    queryKey: ["/api/diseases", diseaseId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isEdit && !!diseaseId,
  });

  useEffect(() => {
    if (disease && isEdit) {
      form.reset({
        name: disease.name,
        icd10Code: disease.icd10Code || "",
        description: disease.description || "",
        treatmentInfo: disease.treatmentInfo || "",
        symptoms: disease.symptoms || "",
        preventionInfo: disease.preventionInfo || "",
      });
      setLoading(false);
    }
  }, [disease, form, isEdit]);

  const createDiseaseMutation = useMutation({
    mutationFn: async (data: DiseaseFormValues) => {
      const res = await apiRequest("POST", "/api/diseases", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Doença cadastrada",
        description: "A doença foi cadastrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/diseases"] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar doença",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDiseaseMutation = useMutation({
    mutationFn: async (data: DiseaseFormValues) => {
      const res = await apiRequest("PATCH", `/api/diseases/${diseaseId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Doença atualizada",
        description: "A doença foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/diseases"] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar doença",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DiseaseFormValues) => {
    if (isEdit) {
      updateDiseaseMutation.mutate(data);
    } else {
      createDiseaseMutation.mutate(data);
    }
  };

  const isPending = createDiseaseMutation.isPending || updateDiseaseMutation.isPending;

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
            <CardTitle>{isEdit ? "Editar Doença" : "Nova Doença"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Doença</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Diabetes Tipo 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icd10Code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CID-10 (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: E11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a doença..." className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sintomas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva os sintomas..." className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatmentInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações de Tratamento (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o tratamento..." className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preventionInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações de Prevenção (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a prevenção..." className="min-h-24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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