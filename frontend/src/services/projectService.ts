const API_URL = 'http://localhost:3000/projects';

export async function getProjects() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erro ao buscar projetos');
  return await res.json();
}

export async function createProject(data: { name: string }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar projeto');
  return await res.json();
}

export async function updateProject(id: number, data: { name: string }) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar projeto');
  return await res.json();
}

export async function deleteProject(id: number) {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir projeto');
  return true;
}
