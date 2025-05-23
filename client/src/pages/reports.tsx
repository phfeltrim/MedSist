import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import ReportsTable from "@/components/reports/ReportsTable";
import ExportButton from "@/components/reports/ExportButton";
import ReportsFilters from "@/components/reports/ReportsFilters";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function ReportsPage() {
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  const { data: ubsList = [] } = useQuery({
    queryKey: ["ubs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/ubs");
      return await res.json();
    },
  });

  const { data: diseaseList = [] } = useQuery({
    queryKey: ["diseases"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/diseases");
      return await res.json();
    },
  });

  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["/api/reports", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.ubsId) queryParams.append("ubsId", filters.ubsId);
      if (filters.diseaseId) queryParams.append("diseaseId", filters.diseaseId);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      const url = "/api/reports?" + queryParams.toString();
      const res = await apiRequest("GET", url);
      return await res.json();
    },
  });

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-50">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <Header
          title="Relatórios"
          breadcrumbs={[
            { label: "Início", path: "/" },
            { label: "Relatórios" },
          ]}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Exportação de Prontuários</h1>
            <ExportButton data={filteredData} />
          </div>

          <ReportsFilters
            ubsOptions={ubsList}
            diseaseOptions={diseaseList}
            onFilter={(f) => setFilters(f)}
          />

          <ReportsTable data={filteredData} isLoading={isLoading || isFetching} error={error} />
        </main>
      </div>
    </div>
  );
}
