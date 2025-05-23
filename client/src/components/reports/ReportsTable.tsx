type Props = {
  data: any[];
  isLoading: boolean;
  error: Error | null;
};

export default function ReportsTable({ data, isLoading, error }: Props) {
  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">Erro: {error.message}</p>;

  if (!data.length) return <p>Nenhum dado encontrado.</p>;

  return (
    <table className="min-w-full border mt-4">
      <thead>
        <tr className="bg-gray-100">
          {Object.keys(data[0]).map((key) => (
            <th key={key} className="text-left p-2 border-b">{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50">
            {Object.values(row).map((value, j) => (
              <td key={j} className="p-2 border-b">{}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
