import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Building2, 
  Stethoscope, 
  ClipboardList, 
  AlertCircle,
  Search,
  UserPlus,
  BarChart3
} from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentPatients } from "@/components/dashboard/recent-patients";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - would be replaced with real API calls
const mockRecentPatients = [
  {
    id: 1,
    name: "Matheus Santos",
    birthDate: "12/04/1988",
    diagnosis: "Sífilis Congênita",
    ubs: "UBS Central",
    status: "em-tratamento" as const
  },
  {
    id: 2,
    name: "Lucia Oliveira",
    birthDate: "23/08/1992",
    diagnosis: "Sífilis Congênita",
    ubs: "UBS Vila Nova",
    status: "concluido" as const
  },
  {
    id: 3,
    name: "Carlos Silva",
    birthDate: "05/12/2020",
    diagnosis: "Sífilis Congênita",
    ubs: "UBS Jardim Esperança",
    status: "critico" as const
  },
  {
    id: 4,
    name: "Julia Pereira",
    birthDate: "18/11/2021",
    diagnosis: "Sífilis Congênita",
    ubs: "UBS Centro",
    status: "acompanhamento" as const
  }
];

const mockActivities = [
  {
    id: 1,
    type: "update" as const,
    performer: "Dra. Ana Silva",
    subject: "Carlos Silva",
    timestamp: "Hoje, 14:35"
  },
  {
    id: 2,
    type: "add-employee" as const,
    performer: "Rodrigo Almeida",
    subject: "Enfermeira Patrícia",
    timestamp: "Hoje, 11:20"
  },
  {
    id: 3,
    type: "create" as const,
    performer: "Dra. Fernanda",
    subject: "Laura Mendes",
    timestamp: "Ontem, 15:40"
  },
  {
    id: 4,
    type: "delete" as const,
    performer: "Marcelo Admin",
    subject: "José Santos",
    timestamp: "Ontem, 09:15"
  }
];

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: statistics, isLoading } = useQuery({
    queryKey: ["/api/statistics"],
    staleTime: 60000, // 1 minute
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <Header 
          title="Dashboard" 
          breadcrumbs={[
            { label: "Início", path: "/" },
            { label: "Dashboard" }
          ]}
          actionLabel="Novo Prontuário"
          actionPath="/medical-records/new"
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
              label="Total de Unidades" 
              value={isLoading ? "..." : statistics?.ubsCount || 0}
              icon={<Building2 className="h-5 w-5 text-primary-500" />}
            />
            
            <StatCard 
              label="Médicos Ativos" 
              value={isLoading ? "..." : statistics?.doctorCount || 0}
              icon={<Stethoscope className="h-5 w-5 text-secondary-500" />}
              iconClassName="bg-secondary-50"
            />
            
            <StatCard 
              label="Prontuários" 
              value={isLoading ? "..." : statistics?.recordCount || 0}
              icon={<ClipboardList className="h-5 w-5 text-blue-500" />}
              iconClassName="bg-blue-50"
            />
            
            <StatCard 
              label="Casos Ativos" 
              value={isLoading ? "..." : statistics?.activeRecordCount || 0}
              icon={<AlertCircle className="h-5 w-5 text-red-500" />}
              iconClassName="bg-red-50"
              trend={{ value: "12% no último mês", direction: "up" }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Patients Section */}
            <div className="lg:col-span-2">
              <RecentPatients 
                patients={mockRecentPatients}
                currentPage={currentPage}
                totalPages={3}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column - Quick Access & Activity */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Access */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/medical-records/new" className="block">
                      <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors">
                        <ClipboardList className="text-primary-500 h-6 w-6 mb-2" />
                        <span className="text-sm text-center font-medium">Novo Prontuário</span>
                      </div>
                    </Link>
                    
                    <Link href="/employees/new" className="block">
                      <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors">
                        <UserPlus className="text-primary-500 h-6 w-6 mb-2" />
                        <span className="text-sm text-center font-medium">Novo Funcionário</span>
                      </div>
                    </Link>
                    
                    <Link href="/medical-records" className="block">
                      <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors">
                        <Search className="text-primary-500 h-6 w-6 mb-2" />
                        <span className="text-sm text-center font-medium">Buscar Paciente</span>
                      </div>
                    </Link>
                    
                    <Link href="/reports" className="block">
                      <div className="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors">
                        <BarChart3 className="text-primary-500 h-6 w-6 mb-2" />
                        <span className="text-sm text-center font-medium">Relatórios</span>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Log */}
              <ActivityLog 
                activities={mockActivities}
                isLoading={isLoading}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
