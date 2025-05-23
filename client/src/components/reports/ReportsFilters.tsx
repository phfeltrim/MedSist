import { useEffect, useState } from "react";

type Props = {
  ubsOptions: { id: number; name: string }[];
  diseaseOptions: { id: number; name: string }[];
  onFilter: (filters: { ubsId?: number; diseaseId?: number; startDate?: string; endDate?: string }) => void;
};

export default function ReportsFilters({ ubsOptions, diseaseOptions, onFilter }: Props) {
  const [ubsId, setUbsId] = useState<number | undefined>();
  const [diseaseId, setDiseaseId] = useState<number | undefined>();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    onFilter({
      ubsId: ubsId || undefined,
      diseaseId: diseaseId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <select className="border p-2 rounded" value={ubsId || ""} onChange={e => setUbsId(Number(e.target.value) || undefined)}>
        <option value="">Todas UBSs</option>
        {ubsOptions.map(ubs => (
          <option key={ubs.id} value={ubs.id}>{ubs.name}</option>
        ))}
      </select>

      <select className="border p-2 rounded" value={diseaseId || ""} onChange={e => setDiseaseId(Number(e.target.value) || undefined)}>
        <option value="">Todas Doenças</option>
        {diseaseOptions.map(disease => (
          <option key={disease.id} value={disease.id}>{disease.name}</option>
        ))}
      </select>

      <input type="date" className="border p-2 rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
      <input type="date" className="border p-2 rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />

      <button
        onClick={handleApply}
        className="md:col-span-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-2"
      >
        Aplicar Filtros
      </button>
    </div>
  );
}
