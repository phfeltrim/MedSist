import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";

interface Patient {
  id: number;
  name: string;
  birthDate: string;
  diagnosis: string;
  ubs: string;
  status: "em-tratamento" | "concluido" | "critico" | "acompanhamento";
}

interface RecentPatientsProps {
  patients: Patient[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function RecentPatients({
  patients,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false
}: RecentPatientsProps) {
  const getStatusBadgeClasses = (status: string) => {
    switch(status) {
      case "em-tratamento":
        return "bg-yellow-100 text-yellow-800";
      case "concluido":
        return "bg-green-100 text-green-800";
      case "critico":
        return "bg-red-100 text-red-800";
      case "acompanhamento":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "em-tratamento":
        return "Em tratamento";
      case "concluido":
        return "Concluído";
      case "critico":
        return "Crítico";
      case "acompanhamento":
        return "Acompanhamento";
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex-row flex border-b justify-between items-center">
        <CardTitle>Prontuários Recentes</CardTitle>
        <Button variant="ghost" asChild>
          <Link href="/medical-records">
            Ver todos
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                <th className="py-3 px-4 text-left font-medium">Paciente</th>
                <th className="py-3 px-4 text-left font-medium">Diagnóstico</th>
                <th className="py-3 px-4 text-left font-medium">UBS</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                          <div className="h-3 w-16 bg-neutral-200 rounded mt-1"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-neutral-200 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-neutral-200 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-6 w-20 bg-neutral-200 rounded"></div></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <div className="h-8 w-8 bg-neutral-200 rounded"></div>
                        <div className="h-8 w-8 bg-neutral-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-500">
                    Nenhum prontuário encontrado
                  </td>
                </tr>
              ) : (
                patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                          {getInitials(patient.name)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-sm">{patient.name}</div>
                          <div className="text-xs text-neutral-500">{patient.birthDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{patient.diagnosis}</td>
                    <td className="py-3 px-4 text-sm">{patient.ubs}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClasses(patient.status)}`}>
                        {getStatusLabel(patient.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/medical-records/${patient.id}/view`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/medical-records/${patient.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-5 border-t border-neutral-100 flex justify-between">
          <div className="text-sm text-neutral-500">
            {isLoading ? (
              <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse"></div>
            ) : (
              `Mostrando ${patients.length > 0 ? (currentPage - 1) * 10 + 1 : 0}-${Math.min(currentPage * 10, (totalPages || 1) * 10)} de ${(totalPages || 1) * 10} resultados`
            )}
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages || 1 }).map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange?.(index + 1)}
                disabled={isLoading}
              >
                {index + 1}
              </Button>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= (totalPages || 1) || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
