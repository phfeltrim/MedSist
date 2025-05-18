const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetcher(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) {
    throw new Error(`Erro na requisição: ${res.statusText}`);
  }
  return res.json();
}