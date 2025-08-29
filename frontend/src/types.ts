export interface Note {
  id: number;
  title: string;
  content: string;
  projectId: number;
}

export interface Project {
  id: number;
  name: string;
}
