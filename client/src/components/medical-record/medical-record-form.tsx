import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { date, z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { sifilesCongenitaSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Create a form schema based on the sifilesCongenitaSchema
const medicalRecordFormSchema = z.object({
  patientName: z.string().min(3, "Nome do paciente deve ter pelo menos 3 caracteres"),
  patientBirthDate: z.string().min(1, "Data de nascimento é obrigatória")
  .transform((str) => new Date(str))
  .refine((date) => !isNaN(date.getTime()),{message: "Data inválida",}),
  diseaseId: z.number({
    required_error: "Selecione uma doença",
  }),
  ubsId: z.number({
    required_error: "Selecione uma UBS",
  }),
  status: z.string({
    required_error: "Selecione um status",
  }),
  data: sifilesCongenitaSchema,
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

interface MedicalRecordFormProps {
  recordId?: number;
  isEdit?: boolean;
  isView?: boolean;
  onComplete?: () => void;
}

export function MedicalRecordForm({ recordId, isEdit = false, isView = false, onComplete }: MedicalRecordFormProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("monitoramento");

  // Fetch all UBS for dropdown
  const { data: ubsList, isLoading: isLoadingUbs } = useQuery({
    queryKey: ["/api/ubs"],
  });

  // Fetch all diseases for dropdown
  const { data: diseasesList, isLoading: isLoadingDiseases } = useQuery({
    queryKey: ["/api/diseases"],
  });

  // Fetch medical record data if editing or viewing
  const { data: recordData, isLoading: isLoadingRecord } = useQuery({
    queryKey: recordId ? [`/api/medical-records/${recordId}`] : null,
    enabled: !!recordId && (isEdit || isView),
  });

  // Default empty data structure matching the schema
  const emptyData = {
    monitoramento_sifilis_congenita: {
      matricula: "",
      data: "",
      nome: "",
      data_nascimento: "",
      encaminhado_por: "",
    },
    historia_materna: {
      nome_mae: "",
      idade: 0,
      anos_pre_natal_ubs: "",
      numero_consultas: 0,
      tratamento: "",
      tratou_parceiro: "",
      observacoes: "",
    },
    historico_hospitalar: {
      local_nascimento: "",
      tipo_parto: "",
      idade_gestacional: "",
      semanas_apgar: "",
      teste_sorologico: "",
      tratamento: "",
      exames_radiologicos: "",
      liquor: "",
    },
    triagem_neonatal: {
      reflexo_vermelho: {
        olho_direito: "",
        olho_esquerdo: "",
      },
      triagem_auditiva: {
        emissao_otoacustica_evocada: "",
        potencial_evocado_auditivo_tronco: "",
        ouvido_direito: "",
        ouvido_esquerdo: "",
      },
      oximetria_pulso: {
        msd: "",
        mid: "",
      },
      teste_linguinha: "",
      observacoes: "",
    },
    acompanhamento_ambulatorio_alto_risco: {
      data_primeira_consulta: "",
      exame_sorologia: "",
      primeiro_mes: {
        data: "",
        resultado: "",
        tratamento: "",
      },
      terceiro_mes: {
        data: "",
        resultado: "",
        tratamento: "",
      },
      sexto_mes: {
        data: "",
        resultado: "",
        tratamento: "",
      },
      decimo_oito_mes: {
        data: "",
        resultado: "",
        tratamento: "",
      },
      liquor_alterado: "",
      acompanhamentos: {
        oftalmologico: false,
        neurologico: false,
        audiologico: false,
        outros: "",
      },
      observacoes: "",
      alta_ambulatorio_alto_risco: "",
      ubs_referencia: "",
    },
  };

  // Initialize the form with default values
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      patientName: "",
      patientBirthDate: new Date(),
      diseaseId: 0,
      ubsId: 0,
      status: "active",
      data: emptyData,
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (recordData) {
      form.reset({
        patientName: recordData.patientName,
        patientBirthDate: new Date(recordData.patientBirthDate),
        diseaseId: recordData.diseaseId || 0,
        ubsId: recordData.ubsId || 0,
        status: recordData.status,
        data: recordData.data as any,
      });
    }
  }, [recordData, form]);

  // Auto-fill patient name from monitoramento section
  useEffect(() => {
    const monitoramentoNome = form.watch("data.monitoramento_sifilis_congenita.nome");
    const dataNascimento = form.watch("data.monitoramento_sifilis_congenita.data_nascimento");
    
    if (monitoramentoNome && monitoramentoNome !== form.getValues("patientName")) {
      form.setValue("patientName", monitoramentoNome);
    }
    
    if (dataNascimento && dataNascimento !== form.getValues("patientBirthDate")) {
      form.setValue("patientBirthDate", dataNascimento);
    }
  }, [form.watch("data.monitoramento_sifilis_congenita.nome"), form.watch("data.monitoramento_sifilis_congenita.data_nascimento")]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      const res = await apiRequest("POST", "/api/medical-records", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Prontuário cadastrado com sucesso",
        description: "O novo prontuário foi adicionado ao sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      navigate("/medical-records");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar prontuário",
        description: error.message || "Não foi possível cadastrar o prontuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      const res = await apiRequest("PUT", `/api/medical-records/${recordId}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Prontuário atualizado com sucesso",
        description: "As informações do prontuário foram atualizadas.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      queryClient.invalidateQueries({ queryKey: [`/api/medical-records/${recordId}`] });
      navigate("/medical-records");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar prontuário",
        description: error.message || "Não foi possível atualizar o prontuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MedicalRecordFormValues) => {
  const formatDate = (value: any) => {
    const date = typeof value === "string" ? new Date(value) : value;
    return date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  };

  const formatted = {
    ...data,
    patientBirthDate: formatDate(data.patientBirthDate),
    data: {
      ...data.data,
      monitoramento_sifilis_congenita: {
        ...data.data.monitoramento_sifilis_congenita,
        data: formatDate(data.data.monitoramento_sifilis_congenita.data),
        data_nascimento: formatDate(data.data.monitoramento_sifilis_congenita.data_nascimento),
      },
      acompanhamento_ambulatorio_alto_risco: {
        ...data.data.acompanhamento_ambulatorio_alto_risco,
        data_primeira_consulta: formatDate(data.data.acompanhamento_ambulatorio_alto_risco.data_primeira_consulta),
        primeiro_mes: {
          ...data.data.acompanhamento_ambulatorio_alto_risco.primeiro_mes,
          data: formatDate(data.data.acompanhamento_ambulatorio_alto_risco.primeiro_mes.data),
        },
        terceiro_mes: {
          ...data.data.acompanhamento_ambulatorio_alto_risco.terceiro_mes,
          data: formatDate(data.data.acompanhamento_ambulatorio_alto_risco.terceiro_mes.data),
        },
        sexto_mes: {
          ...data.data.acompanhamento_ambulatorio_alto_risco.sexto_mes,
          data: formatDate(data.data.acompanhamento_ambulatorio_alto_risco.sexto_mes.data),
        },
        decimo_oito_mes: {
          ...data.data.acompanhamento_ambulatorio_alto_risco.decimo_oito_mes,
          data: formatDate(data.data.acompanhamento_ambulatorio_alto_risco.decimo_oito_mes.data),
        },
      },
    },
  };

    if (isEdit && recordId) {
      updateMutation.mutate(formatted);
    } else {
      createMutation.mutate(formatted);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLoading = isLoadingRecord || isLoadingUbs || isLoadingDiseases;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {isView 
            ? "Visualizar Prontuário - Sífilis Congênita" 
            : isEdit 
              ? "Editar Prontuário - Sífilis Congênita" 
              : "Cadastro de Prontuário - Sífilis Congênita"}
        </CardTitle>
        <p className="text-sm text-neutral-500 mt-1">
          {isView 
            ? "Visualize os dados do prontuário do paciente" 
            : "Preencha todos os dados do paciente conforme as seções abaixo"}
        </p>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-4">
                  <FormField
                    control={form.control}
                    name="diseaseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doença</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                          disabled={isView}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma doença" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {diseasesList?.map((disease) => (
                              <SelectItem key={disease.id} value={disease.id.toString()}>
                                {disease.name}
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
                    name="ubsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade (UBS)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                          disabled={isView}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isView}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="critical">Crítico</SelectItem>
                            <SelectItem value="follow-up">Acompanhamento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs defaultValue="monitoramento" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="flex overflow-x-auto space-x-8 mb-6 border-b w-full justify-start">
                    <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
                    <TabsTrigger value="historia-materna">História Materna</TabsTrigger>
                    <TabsTrigger value="historico-hospitalar">Histórico Hospitalar</TabsTrigger>
                    <TabsTrigger value="triagem-neonatal">Triagem Neonatal</TabsTrigger>
                    <TabsTrigger value="acompanhamento">Acompanhamento</TabsTrigger>
                  </TabsList>
                  
                  {/* Monitoramento Tab */}
                  <TabsContent value="monitoramento">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.monitoramento_sifilis_congenita.matricula"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Matrícula</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.monitoramento_sifilis_congenita.data"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Registro</FormLabel>
                            <FormControl>
                              <Input type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="data.monitoramento_sifilis_congenita.nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Paciente</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.monitoramento_sifilis_congenita.data_nascimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="data.monitoramento_sifilis_congenita.encaminhado_por"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Encaminhado por</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UBS">UBS</SelectItem>
                                <SelectItem value="Hospital">Hospital</SelectItem>
                                <SelectItem value="Maternidade">Maternidade</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* História Materna Tab */}
                  <TabsContent value="historia-materna">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historia_materna.nome_mae"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Mãe</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historia_materna.idade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                disabled={isView} 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historia_materna.anos_pre_natal_ubs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pré-natal na UBS</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historia_materna.numero_consultas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Consultas</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                disabled={isView} 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historia_materna.tratamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tratamento</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Adequado">Adequado</SelectItem>
                                <SelectItem value="Inadequado">Inadequado</SelectItem>
                                <SelectItem value="Não realizado">Não realizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historia_materna.tratou_parceiro"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tratou Parceiro</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sim">Sim</SelectItem>
                                <SelectItem value="Não">Não</SelectItem>
                                <SelectItem value="Parcialmente">Parcialmente</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="data.historia_materna.observacoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3} 
                                disabled={isView} 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Histórico Hospitalar Tab */}
                  <TabsContent value="historico-hospitalar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.local_nascimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local de Nascimento</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.tipo_parto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Parto</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Cesárea">Cesárea</SelectItem>
                                <SelectItem value="Fórceps">Fórceps</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.idade_gestacional"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade Gestacional</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.semanas_apgar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Semanas A/PGAR</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.teste_sorologico"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teste Sorológico</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.tratamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tratamento</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.exames_radiologicos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exames Radiológicos</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.historico_hospitalar.liquor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Líquor</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Triagem Neonatal Tab */}
                  <TabsContent value="triagem-neonatal">
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Reflexo Vermelho</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.reflexo_vermelho.olho_direito"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Olho Direito</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={isView}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Alterado">Alterado</SelectItem>
                                  <SelectItem value="Não realizado">Não realizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.reflexo_vermelho.olho_esquerdo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Olho Esquerdo</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={isView}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Alterado">Alterado</SelectItem>
                                  <SelectItem value="Não realizado">Não realizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Triagem Auditiva</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.triagem_auditiva.emissao_otoacustica_evocada"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emissão Otoacústica Evocada</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={isView}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Alterado">Alterado</SelectItem>
                                  <SelectItem value="Não realizado">Não realizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.triagem_auditiva.potencial_evocado_auditivo_tronco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Potencial Evocado Auditivo de Tronco</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={isView}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Alterado">Alterado</SelectItem>
                                  <SelectItem value="Não realizado">Não realizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.triagem_auditiva.ouvido_direito"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ouvido Direito</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={isView}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Alterado">Alterado</SelectItem>
                                  <SelectItem value="Não realizado">Não realizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.triagem_auditiva.ouvido_esquerdo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ouvido Esquerdo</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                disabled={isView}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma opção" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Normal">Normal</SelectItem>
                                  <SelectItem value="Alterado">Alterado</SelectItem>
                                  <SelectItem value="Não realizado">Não realizado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Oximetria de Pulso</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.oximetria_pulso.msd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MSD</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.triagem_neonatal.oximetria_pulso.mid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MID</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.triagem_neonatal.teste_linguinha"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teste da Linguinha</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Alterado">Alterado</SelectItem>
                                <SelectItem value="Não realizado">Não realizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.triagem_neonatal.observacoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3} 
                                disabled={isView} 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Acompanhamento Tab */}
                  <TabsContent value="acompanhamento">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.acompanhamento_ambulatorio_alto_risco.data_primeira_consulta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data da Primeira Consulta</FormLabel>
                            <FormControl>
                              <Input type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.acompanhamento_ambulatorio_alto_risco.exame_sorologia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Exame de Sorologia</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Primeiro Mês</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.primeiro_mes.data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <Input type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.primeiro_mes.resultado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resultado</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.primeiro_mes.tratamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tratamento</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Terceiro Mês</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.terceiro_mes.data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <Input type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.terceiro_mes.resultado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resultado</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.terceiro_mes.tratamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tratamento</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Sexto Mês</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.sexto_mes.data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <Input type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.sexto_mes.resultado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resultado</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.sexto_mes.tratamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tratamento</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Décimo Oitavo Mês</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.decimo_oito_mes.data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <Input type="date"
                                disabled={isView}
                                value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                                onChange={(e) => field.onChange(new Date(e.target.value))}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.decimo_oito_mes.resultado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Resultado</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.decimo_oito_mes.tratamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tratamento</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="data.acompanhamento_ambulatorio_alto_risco.liquor_alterado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Líquor Alterado</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sim">Sim</SelectItem>
                                <SelectItem value="Não">Não</SelectItem>
                                <SelectItem value="Não realizado">Não realizado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-md font-medium mb-3">Acompanhamentos</h3>
                      <div className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.acompanhamentos.oftalmologico"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isView}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Oftalmológico</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.acompanhamentos.neurologico"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isView}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Neurológico</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.acompanhamentos.audiologico"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={isView}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Audiológico</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="data.acompanhamento_ambulatorio_alto_risco.acompanhamentos.outros"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Outros Acompanhamentos</FormLabel>
                              <FormControl>
                                <Input disabled={isView} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <FormField
                        control={form.control}
                        name="data.acompanhamento_ambulatorio_alto_risco.observacoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Observações</FormLabel>
                            <FormControl>
                              <Textarea 
                                rows={3} 
                                disabled={isView} 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <FormField
                        control={form.control}
                        name="data.acompanhamento_ambulatorio_alto_risco.alta_ambulatorio_alto_risco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alta do Ambulatório de Alto Risco</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                              disabled={isView}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Sim">Sim</SelectItem>
                                <SelectItem value="Não">Não</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="data.acompanhamento_ambulatorio_alto_risco.ubs_referencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UBS de Referência</FormLabel>
                            <FormControl>
                              <Input disabled={isView} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-5 border-t border-neutral-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/medical-records")}
              disabled={isSubmitting}
            >
              {isView ? "Voltar" : "Cancelar"}
            </Button>
            {!isView && (
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={isSubmitting || isLoading}
                  onClick={() => {
                    // Save current values and navigate to the next tab
                    const currentTabIndex = ["monitoramento", "historia-materna", "historico-hospitalar", "triagem-neonatal", "acompanhamento"].indexOf(activeTab);
                    if (currentTabIndex < 4) {
                      const nextTab = ["monitoramento", "historia-materna", "historico-hospitalar", "triagem-neonatal", "acompanhamento"][currentTabIndex + 1];
                      setActiveTab(nextTab);
                    }
                  }}
                >
                  Próximo
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Atualizar Prontuário" : "Salvar Prontuário"}
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
