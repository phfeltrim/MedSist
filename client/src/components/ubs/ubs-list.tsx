import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Ubs } from "@shared/schema";

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
  Building2,
  Phone,
  Users,
  Filter,
  SortAsc,
  Plus,
  Loader2
} from "lucide-react";

interface UbsListProps {
  onEdit?: (id: number) => void;
  onNew?: () => void;
}

export function UbsList({ onEdit, onNew }: UbsListProps) {
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteUbsId, setDeleteUbsId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch UBS list
  const { data: ubsList, isLoading } = useQuery<Ubs[]>({
    queryKey: ["/api/ubs"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/ubs/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "UBS excluída com sucesso",
        description: "A unidade foi removida do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ubs"] });
      setDeleteUbsId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir UBS",
        description: error.message || "Não foi possível excluir a UBS. Tente novamente.",
        variant: "destructive",
      });
      setDeleteUbsId(null);
    },
  });

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    setDeleteUbsId(id);
  };

  const handleDelete = () => {
    if (deleteUbsId) {
      deleteMutation.mutate(deleteUbsId);
    }
  };

  // Filter and sort UBS list
  const filteredUbsList = ubsList
    ? ubsList
        .filter(ubs => 
          (ubs.name.toLowerCase().includes(search.toLowerCase()) ||
           ubs.address.toLowerCase().includes(search.toLowerCase())) &&
          (districtFilter ? ubs.district?.toLowerCase() === districtFilter.toLowerCase() : true)
        )
        .sort((a, b) => {
          if (sortOrder === "asc") {
            return a.name.localeCompare(b.name);
          } else if (sortOrder === "desc") {
            return b.name.localeCompare(a.name);
          } else if (sortOrder === "recent") {
            return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - 
                   (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          } else {
            return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - 
                   (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          }
        })
    : [];
  
  // Extract unique districts for filtering
  const districts = ubsList
    ? Array.from(new Set(ubsList.map(ubs => ubs.district).filter(Boolean)))
    : [];

  return (
    <>
      <Card className="shadow rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center border-b">
          <h2 className="font-heading font-semibold text-lg">Unidades Básicas de Saúde (UBS)</h2>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4 mr-1" />
            Nova UBS
          </Button>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Search className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <Input 
                type="text" 
                placeholder="Buscar por nome ou endereço..." 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Filter className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
              >
                <option value="">Todos os distritos</option>
                {districts.map((district, index) => (
                  <option key={index} value={district || ""}>{district}</option>
                ))}
              </select>
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
          ) : filteredUbsList.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {search || districtFilter 
                ? "Nenhuma UBS encontrada com os filtros aplicados."
                : "Nenhuma UBS cadastrada no sistema."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUbsList.map((ubs) => (
                <div key={ubs.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 border-b border-neutral-100 flex justify-between">
                    <h3 className="font-medium">{ubs.name}</h3>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEdit && onEdit(ubs.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(ubs.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start mb-2">
                      <Building2 className="text-neutral-500 h-4 w-4 mr-2 mt-0.5" />
                      <span className="text-sm text-neutral-600">{ubs.address}, {ubs.city}/{ubs.state}</span>
                    </div>
                    <div className="flex items-start mb-2">
                      <Phone className="text-neutral-500 h-4 w-4 mr-2 mt-0.5" />
                      <span className="text-sm text-neutral-600">{ubs.phone || "Não informado"}</span>
                    </div>
                    <div className="flex items-start">
                      <Users className="text-neutral-500 h-4 w-4 mr-2 mt-0.5" />
                      <span className="text-sm text-neutral-600">- funcionários</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-100">
                      <div className="flex justify-between text-sm">
                        <span>Pacientes ativos:</span>
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

      <AlertDialog open={!!deleteUbsId} onOpenChange={() => setDeleteUbsId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta UBS? Esta ação não pode ser desfeita.
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
