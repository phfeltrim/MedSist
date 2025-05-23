import * as XLSX from "xlsx";

type Props = {
  data: any[];
};

export default function ExportButton({ data }: Props) {
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

    XLSX.writeFile(workbook, "relatorio.xlsx");
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data.length}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
    >
      Exportar para Excel
    </button>
  );
}
