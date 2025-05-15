import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Disease } from "@shared/schema";

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
  Trash2,
  Search,
  SortAsc,
  Plus,
  FileText,
  FileBadge,
  Loader2
} from "lucide-react";

interface DiseaseListProps {
  onEdit?: (id: number) => void;
  onNew?: () => void;
}

export function DiseaseList({ onEdit, onNew }: DiseaseListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteDiseaseId, setDeleteDiseaseId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all diseases
  const { data: diseases, isLoading } = useQuery<Disease[]>({
    queryKey: ["/api/diseases"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/diseases/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Doença excluída com sucesso",
        description: "A doença foi removida do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/diseases"] });
      setDeleteDiseaseId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir doença",
        description: error.message || "Não foi possível excluir a doença. Tente novamente.",
        variant: "destructive",
      });
      setDeleteDiseaseId(null);
    },
  });

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    setDeleteDiseaseId(id);
  };

  const handleDelete = () => {
    if (deleteDiseaseId) {
      deleteMutation.mutate(deleteDiseaseId);
    }
  };

  // Filter and sort diseases
  const filteredDiseases = diseases
    ? diseases
        .filter(disease => 
          disease.name.toLowerCase().includes(search.toLowerCase()) ||
          (disease.icd10Code && disease.icd10Code.toLowerCase().includes(search.toLowerCase())) ||
          (disease.description && disease.description.toLowerCase().includes(search.toLowerCase()))
        )
        .sort((a, b) => {
          if (sortOrder === "asc") {
            return a.name.localeCompare(b.name);
          } else if (sortOrder === "desc") {
            return b.name.localeCompare(a.name);
          } else if (sortOrder === "recent") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
        })
    : [];

  return (
    <>
      <Card className="shadow rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center border-b">
          <h2 className="font-heading font-semibold text-lg">Doenças Cadastradas</h2>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Doença
          </Button>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Search className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <Input 
                type="text" 
                placeholder="Buscar por nome, CID ou descrição..." 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <SortAsc className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Ordenar por Nome (A-Z)</option>
                <option value="desc">Ordenar por Nome (Z-A)</option>
                <option value="recent">Data de cadastro mais recente</option>
                <option value="oldest">Data de cadastro mais antiga</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : filteredDiseases.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {search 
                ? "Nenhuma doença encontrada com os critérios de busca."
                : "Nenhuma doença cadastrada no sistema."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiseases.map((disease) => (
                <div key={disease.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 border-b border-neutral-100 flex justify-between">
                    <h3 className="font-medium">{disease.name}</h3>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => onEdit?.(disease.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(disease.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    {disease.icd10Code && (
                      <div className="flex items-start mb-2">
                        <FileBadge className="text-neutral-500 h-4 w-4 mr-2 mt-0.5" />
                        <span className="text-sm text-neutral-600">CID-10: {disease.icd10Code}</span>
                      </div>
                    )}
                    {disease.description && (
                      <div className="flex items-start mb-2">
                        <FileText className="text-neutral-500 h-4 w-4 mr-2 mt-0.5" />
                        <span className="text-sm text-neutral-600 line-clamp-3">
                          {disease.description}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <div className="flex justify-between text-sm">
                        <span>Prontuários associados:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteDiseaseId} onOpenChange={() => setDeleteDiseaseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta doença? Esta ação não pode ser desfeita 
              e pode afetar prontuários que referenciam esta doença.
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
