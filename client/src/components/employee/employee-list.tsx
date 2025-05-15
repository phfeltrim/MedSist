import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@shared/schema";

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
  User,
  Mail,
  Phone,
  Filter,
  SortAsc,
  Building2,
  Plus,
  BadgeCheck,
  BadgeX,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmployeeListProps {
  onEdit?: (id: number) => void;
  onNew?: () => void;
}

export function EmployeeList({ onEdit, onNew }: EmployeeListProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [ubsFilter, setUbsFilter] = useState<number | "">("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all employees
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Fetch all UBS for filtering
  const { data: ubsList } = useQuery({
    queryKey: ["/api/ubs"],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Funcionário excluído com sucesso",
        description: "O funcionário foi removido do sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setDeleteEmployeeId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir funcionário",
        description: error.message || "Não foi possível excluir o funcionário. Tente novamente.",
        variant: "destructive",
      });
      setDeleteEmployeeId(null);
    },
  });

  // Handle delete confirmation
  const confirmDelete = (id: number) => {
    setDeleteEmployeeId(id);
  };

  const handleDelete = () => {
    if (deleteEmployeeId) {
      deleteMutation.mutate(deleteEmployeeId);
    }
  };

  // Filter and sort employees
  const filteredEmployees = employees
    ? employees
        .filter(employee => 
          (employee.name.toLowerCase().includes(search.toLowerCase()) ||
           employee.email.toLowerCase().includes(search.toLowerCase())) &&
          (roleFilter ? employee.role === roleFilter : true) &&
          (ubsFilter ? employee.ubsId === Number(ubsFilter) : true)
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

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "doctor":
        return <Badge className="bg-blue-500">Médico</Badge>;
      case "nurse":
        return <Badge className="bg-green-500">Enfermeiro</Badge>;
      case "administrative":
        return <Badge className="bg-amber-500">Administrativo</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getUbsName = (ubsId?: number) => {
    if (!ubsId || !ubsList) return "N/A";
    const ubs = ubsList.find(u => u.id === ubsId);
    return ubs?.name || "N/A";
  };

  return (
    <>
      <Card className="shadow rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center border-b">
          <h2 className="font-heading font-semibold text-lg">Funcionários</h2>
          <Button onClick={onNew}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Funcionário
          </Button>
        </CardHeader>
        
        <CardContent className="p-5">
          <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center border rounded-md overflow-hidden md:col-span-2">
              <Search className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <Input 
                type="text" 
                placeholder="Buscar por nome ou email..." 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Filter className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Todas as funções</option>
                <option value="doctor">Médicos</option>
                <option value="nurse">Enfermeiros</option>
                <option value="administrative">Administrativos</option>
              </select>
            </div>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Building2 className="text-neutral-400 h-4 w-4 ml-3 mr-1" />
              <select 
                className="flex h-10 w-full border-0 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-0"
                value={ubsFilter === "" ? "" : ubsFilter.toString()}
                onChange={(e) => setUbsFilter(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">Todas as UBS</option>
                {ubsList?.map((ubs) => (
                  <option key={ubs.id} value={ubs.id.toString()}>{ubs.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {isLoadingEmployees ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              {search || roleFilter || ubsFilter 
                ? "Nenhum funcionário encontrado com os filtros aplicados."
                : "Nenhum funcionário cadastrado no sistema."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                    <th className="px-4 py-3 text-left font-medium">Função</th>
                    <th className="px-4 py-3 text-left font-medium">UBS</th>
                    <th className="px-4 py-3 text-left font-medium">Contato</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                            {employee.name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-sm">{employee.name}</div>
                            {employee.specialty && (
                              <div className="text-xs text-neutral-500">{employee.specialty}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getRoleBadge(employee.role)}
                        {employee.licenseNumber && (
                          <div className="text-xs text-neutral-500 mt-1">{employee.licenseNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">{getUbsName(employee.ubsId)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-xs text-neutral-600">
                            <Mail className="h-3 w-3 mr-1" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="flex items-center text-xs text-neutral-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {employee.isActive ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <BadgeCheck className="h-4 w-4 mr-1" />
                            Ativo
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500 text-sm">
                            <BadgeX className="h-4 w-4 mr-1" />
                            Inativo
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => onEdit?.(employee.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => confirmDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteEmployeeId} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
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
