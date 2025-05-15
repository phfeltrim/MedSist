import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Zod schema for UBS form validation
const ubsFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "Estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  district: z.string().optional(),
});

type UbsFormValues = z.infer<typeof ubsFormSchema>;

interface UbsFormProps {
  ubsId?: number;
  isEdit?: boolean;
  onComplete?: () => void;
}

export function UbsForm({ ubsId, isEdit = false, onComplete }: UbsFormProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch UBS data if editing
  const { data: ubsData, isLoading: isLoadingUbs } = useQuery({
    queryKey: ubsId ? [`/api/ubs/${ubsId}`] : [],
    enabled: !!ubsId && isEdit,
  });

  // Initialize the form with default values
  const form = useForm<UbsFormValues>({
    resolver: zodResolver(ubsFormSchema),
    defaultValues: ubsData || {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      district: "",
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (ubsData) {
      Object.keys(ubsData).forEach((key) => {
        if (key in form.getValues()) {
          form.setValue(key as keyof UbsFormValues, ubsData[key as keyof typeof ubsData]);
        }
      });
    }
  }, [ubsData, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: UbsFormValues) => {
      const res = await apiRequest("POST", "/api/ubs", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "UBS criada com sucesso",
        description: "A unidade básica de saúde foi cadastrada no sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ubs"] });
      navigate("/ubs");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar UBS",
        description: error.message || "Não foi possível criar a UBS. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UbsFormValues) => {
      const res = await apiRequest("PUT", `/api/ubs/${ubsId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "UBS atualizada com sucesso",
        description: "As informações da unidade foram atualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ubs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/ubs/${ubsId}`] });
      navigate("/ubs");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar UBS",
        description: error.message || "Não foi possível atualizar a UBS. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: UbsFormValues) => {
    if (isEdit && ubsId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Handle callback after success
  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      if (onComplete) {
        onComplete();
      }
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, onComplete]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar UBS" : "Cadastrar Nova UBS"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {isLoadingUbs ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da UBS</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: UBS Central" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número, bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distrito</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Norte, Sul, Leste, Oeste, Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: SP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 01234-567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(XX) XXXXX-XXXX" {...field} />
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
                          <Input placeholder="contato@ubs.gov.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onComplete ? onComplete : () => navigate("/ubs")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || isLoadingUbs}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Atualizar UBS" : "Cadastrar UBS"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
