import { useEffect, useState } from 'react';
import './App.css';
import type { Note, Project } from './types';

const App = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string }>({});

  // Buscar projetos
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:3000/projects');
        if (!res.ok) throw new Error('Failed to load projects');
        const data: Project[] = await res.json();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (e) {
        setError('Failed to load projects. Please try again.');
      }
    };
    fetchProjects();
  }, []);

  // Buscar notas do projeto selecionado
  useEffect(() => {
    if (!selectedProject) return;
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/notes?projectId=${selectedProject.id}`);
        if (!res.ok) throw new Error('Failed to load notes');
        const data: Note[] = await res.json();
        setNotes(data);
      } catch (e) {
        setError('Failed to load notes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, [selectedProject]);

  const validateForm = () => {
    const errors: { title?: string; content?: string } = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!content.trim()) errors.content = 'Content is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm() || !selectedProject) return;

    setIsLoading(true);
    setError(null);

    const optimisticNote = { id: Date.now(), title, content, projectId: selectedProject.id };
    setNotes(prev => [optimisticNote, ...prev]);

    try {
      const response = await fetch('http://localhost:3000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ title, content, projectId: selectedProject.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create note');
      }

      const newNote: Note = await response.json();
      setNotes(prev => prev.map(n => n.id === optimisticNote.id ? newNote : n));

      setTitle('');
      setContent('');
    } catch (e: any) {
      setNotes(prev => prev.filter(n => n.id !== optimisticNote.id));
      setError(e.message || 'Failed to add note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedNote || !validateForm()) return;

    setIsLoading(true);
    setError(null);

    const updatedNote = { ...selectedNote, title, content };
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));

    try {
      const response = await fetch(`http://localhost:3000/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, projectId: selectedProject?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update note');
      }

      const newNote: Note = await response.json();
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? newNote : n));

      setTitle('');
      setContent('');
      setSelectedNote(null);
    } catch (e: any) {
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? selectedNote : n));
      setError(e.message || 'Failed to update note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setSelectedNote(null);
    setFormErrors({});
  };

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();
    setIsLoading(true);
    setError(null);
    const deletedNote = notes.find(n => n.id === noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));

    try {
      const response = await fetch(`http://localhost:3000/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }
    } catch (e: any) {
      if (deletedNote) setNotes(prev => [deletedNote, ...prev]);
      setError(e.message || 'Failed to delete note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <aside className="projects-sidebar">
        <h2>Projects</h2>
        <ul>
          {projects.map(project => (
            <li
              key={project.id}
              className={selectedProject?.id === project.id ? 'active' : ''}
              onClick={() => setSelectedProject(project)}
            >
              {project.name}
            </li>
          ))}
        </ul>
      </aside>
      <main className="main-content">
        <form
          className="note-form"
          onSubmit={selectedNote ? handleUpdateNote : handleAddNote}
        >
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            aria-invalid={!!formErrors.title}
            disabled={isLoading}
          />
          {formErrors.title && <span className="error">{formErrors.title}</span>}

          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Content"
            rows={10}
            aria-invalid={!!formErrors.content}
            disabled={isLoading}
          />
          {formErrors.content && <span className="error">{formErrors.content}</span>}

          {error && (
            <div className="error" role="alert" aria-live="polite">
              {error}
              <button onClick={() => setError(null)} disabled={isLoading}>Retry</button>
            </div>
          )}

          {selectedNote ? (
            <div className="edit-buttons">
              <button type="submit" disabled={isLoading || !!formErrors.title || !!formErrors.content}>
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleCancel} disabled={isLoading}>Cancel</button>
            </div>
          ) : (
            <button type="submit" disabled={isLoading || !!formErrors.title || !!formErrors.content}>
              {isLoading ? 'Adding...' : 'Add Note'}
            </button>
          )}
        </form>

        <div className="notes-grid">
          {isLoading ? (
            <div className="skeleton">Loading...</div>
          ) : notes.length === 0 ? (
            <p>No notes available.</p>
          ) : (
            notes.map(note => (
              <div
                key={note.id}
                className="note-item"
                onClick={() => setSelectedNote(note)}
                onKeyPress={e => e.key === 'Enter' && setSelectedNote(note)}
                role="button"
                tabIndex={0}
              >
                <div className="notes-header">
                  <button
                    onClick={e => deleteNote(e, note.id)}
                    aria-label={`Delete note ${note.title}`}
                    disabled={isLoading}
                  >
                    x
                  </button>
                </div>
                <h2>{note.title}</h2>
                <p>{note.content}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
