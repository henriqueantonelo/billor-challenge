const API_URL = 'http://localhost:3000';

export async function getNotes(projectId: number) {
  const res = await fetch(`${API_URL}/projects/${projectId}/notes`);
  if (!res.ok) throw new Error('Erro ao buscar notas');
  return await res.json();
}

export async function createNote(data: { title: string; content: string; projectId: number }) {
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar nota');
  return await res.json();
}

export async function updateNote(id: number, data: { title: string; content: string; projectId: number }) {
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar nota');
  return await res.json();
}

export async function deleteNote(id: number) {
  const res = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir nota');
  return true;
}
