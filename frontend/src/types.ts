export interface Note {
  id: number;
  title: string;
  content: string;
  projectId: number;
}

export interface Project {
  id: number;
  name: string;
  // se quiser, você pode adicionar um array de notas aqui:
  // notes?: Note[];
}
