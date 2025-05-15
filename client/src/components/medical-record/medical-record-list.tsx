import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MedicalRecord } from "@shared/schema";
import { format } from "date-fns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  UserCircle,
  Calendar,
  SortAsc,
  Plus,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface MedicalRecordListProps {
  onNew?: () => void;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
}

export function MedicalRecordList({ onNew, onEdit, onView }: MedicalRecordListProps) {
  const [search, setSearch] = useState("");
  const [ubsFilter, setUbsFilter] = useState<number | "">("");
  const [diseaseFilter, setDiseaseFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all medical records
  const { data: records, isLoading: isLoadingRecords } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records", ubsFilter, diseaseFilter],
    queryFn: async ({ queryKey }) => {
      const [_, ubsId, diseaseId] = queryKey;
      let url = "/api/medical-records";
      
      const params = new URLSearchParams();
      if (ubsId) params.append("ubsId", ubsId as string);
      if (diseaseId) params.append("diseaseId", diseaseId as string);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch records");
      }
      return res.json();
    }
  });

  // Fetch all UBS for filtering
  const { data: ubsList } = useQuery({
    queryKey: ["/api/ubs"],
  });

  // Fetch all diseases for filtering
  const { data: diseasesList } = useQuery({
    queryKey: ["/api/diseases"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medical-records/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Prontuário excluído com sucesso",
        description: "O prontuário foi removido do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      setDeleteRecordId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir prontuário",
        description: error.message || "Não foi possível excluir o prontuário. Tente novamente.",
        variant: "destructive",
      });
      setDeleteRecordId(null);
    },
  });

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    setDeleteRecordId(id);
  };

  const handleDelete = () => {
    if (deleteRecordId) {
      deleteMutation.mutate(deleteRecordId);
    }
  };

  const canDeleteRecords = user?.role === "admin";

  // Filter and sort medical records
  const filteredRecords = records
    ? records
        .filter(record => 
          (record.patientName.toLowerCase().includes(search.toLowerCase())) &&
          (statusFilter ? record.status === statusFilter : true)
        )
        .sort((a, b) => {
          if (sortOrder === "recent") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (sortOrder === "oldest") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          } else if (sortOrder === "asc") {
            return a.patientName.localeCompare(b.patientName);
          } else if (sortOrder === "desc") {
            return b.patientName.localeCompare(a.patientName);
          }
          return 0;
        })
    : [];

  // Pagination
  const totalPages = Math.ceil((filteredRecords?.length || 0) / recordsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Helper function to get disease name
  const getDiseaseName = (diseaseId?: number) => {
    if (!diseaseId || !diseasesList) return "N/A";
    const disease = diseasesList.find(d => d.id === diseaseId);
    return disease?.name || "N/A";
  };

  // Helper function to get UBS name
  const getUbsName = (ubsId?: number) => {
    if (!ubsId || !ubsList) return "N/A";
    const ubs = ubsList.find(u => u.id === ubsId);
    return ubs?.name || "N/A";
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-yellow-500">Em tratamento</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Concluído</Badge>;
      case "critical":
        return <Badge className="bg-red-500">Crítico</Badge>;
      case "follow-up":
        return <Badge className="bg-blue-500">Acompanhamento</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="shadow rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center border-b">
          <h2 className="font-heading font-semibold text-lg">Prontuários Médicos</h2>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Prontuário
          </Button>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center border rounded-md overflow-hidden md:col-span-2">
              <Search className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <Input 
                type="text" 
                placeholder="Buscar por nome do paciente..." 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Filter className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={diseaseFilter === "" ? "" : diseaseFilter.toString()}
                onChange={(e) => {
                  setDiseaseFilter(e.target.value === "" ? "" : Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas as doenças</option>
                {diseasesList?.map((disease) => (
                  <option key={disease.id} value={disease.id.toString()}>{disease.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Filter className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={ubsFilter === "" ? "" : ubsFilter.toString()}
                onChange={(e) => {
                  setUbsFilter(e.target.value === "" ? "" : Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="">Todas as UBS</option>
                {ubsList?.map((ubs) => (
                  <option key={ubs.id} value={ubs.id.toString()}>{ubs.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Filter className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Todos os status</option>
                <option value="active">Em tratamento</option>
                <option value="completed">Concluído</option>
                <option value="critical">Crítico</option>
                <option value="follow-up">Acompanhamento</option>
              </select>
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <SortAsc className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="recent">Mais recentes primeiro</option>
                <option value="oldest">Mais antigos primeiro</option>
                <option value="asc">Nome (A-Z)</option>
                <option value="desc">Nome (Z-A)</option>
              </select>
            </div>
          </div>
          
          {isLoadingRecords ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {search || statusFilter || ubsFilter || diseaseFilter
                ? "Nenhum prontuário encontrado com os filtros aplicados."
                : "Nenhum prontuário cadastrado no sistema."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                      <th className="px-4 py-3 text-left font-medium">Paciente</th>
                      <th className="px-4 py-3 text-left font-medium">Diagnóstico</th>
                      <th className="px-4 py-3 text-left font-medium">UBS</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Data</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {paginatedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                              {record.patientName.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-sm">{record.patientName}</div>
                              <div className="text-xs text-neutral-500">
                                {formatDate(record.patientBirthDate.toString())}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {getDiseaseName(record.diseaseId)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {getUbsName(record.ubsId)}
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {formatDate(record.createdAt.toString())}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onView?.(record.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onEdit?.(record.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {canDeleteRecords && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => confirmDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-neutral-500">
                  Mostrando {filteredRecords.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0} - {Math.min(currentPage * recordsPerPage, filteredRecords.length)} de {filteredRecords.length} resultados
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </Button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Calculate page numbers to show (centered around current page)
                    let pageToShow = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageToShow = currentPage - 3 + i;
                      }
                      if (currentPage > totalPages - 2) {
                        pageToShow = totalPages - 4 + i;
                      }
                    }
                    
                    // Ensure page number is within valid range
                    if (pageToShow <= totalPages) {
                      return (
                        <Button
                          key={pageToShow}
                          variant={currentPage === pageToShow ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageToShow)}
                        >
                          {pageToShow}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteRecordId} onOpenChange={() => setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
