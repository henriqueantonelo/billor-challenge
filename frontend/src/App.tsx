import { useEffect, useState } from 'react';
import './App.css';
import type { Note, Project } from './types';

const App = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ title?: string; content?: string }>({});

  // Fetch all projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3000/projects');
        if (!response.ok) throw new Error('Failed to load projects');
        const data: Project[] = await response.json();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (e) {
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch notes whenever selected project changes
  useEffect(() => {
    if (!selectedProject) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/notes?projectId=${selectedProject.id}`);
        if (!response.ok) throw new Error('Failed to load notes');
        const data: Note[] = await response.json();
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

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const newProject: Project = await response.json();
      setProjects(prev => [...prev, newProject]);
      setSelectedProject(newProject);
      setNewProjectName('');
      setIsNewProjectModalOpen(false);
    } catch (e: any) {
      setError(e.message || 'Failed to add project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
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
      setIsNewNoteModalOpen(false);
    } catch (e: any) {
      setNotes(prev => prev.filter(n => n.id !== optimisticNote.id));
      setError(e.message || 'Failed to add note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !validateForm() || !selectedProject) return;

    setIsLoading(true);
    setError(null);
    const updatedNote = { ...selectedNote, title, content };
    setNotes(notes.map(n => n.id === selectedNote.id ? updatedNote : n));

    try {
      const response = await fetch(`http://localhost:3000/notes/${selectedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, projectId: selectedProject.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update note');
      }

      const newNote: Note = await response.json();
      setNotes(notes.map(n => n.id === selectedNote.id ? newNote : n));
      setTitle('');
      setContent('');
      setMode('view');
    } catch (e: any) {
      setNotes(notes); // Rollback
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
    setIsEditModalOpen(false);
    setEditProject(null);
    setIsNewProjectModalOpen(false);
    setIsNewNoteModalOpen(false);
    setIsNoteModalOpen(false);
    setMode('view');
  };

const deleteNote = async (noteId: number) => {
  setIsLoading(true);
  setError(null);

  const previousNotes = [...notes]; // salva o estado atual
  setNotes(notes.filter(n => n.id !== noteId));

  try {
    const response = await fetch(`http://localhost:3000/notes/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete note');
    }

    setIsNoteModalOpen(false);
  } catch (e: any) {
    setError(e.message || 'Failed to delete note. Please try again.');
    setNotes(previousNotes); // rollback correto
  } finally {
    setIsLoading(false);
  }
};


  const handleEditProjectClick = () => {
    if (selectedProject) {
      handleEditProject(selectedProject);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditProject(project);
    setNewProjectName(project.name);
    setIsEditModalOpen(true);
  };

  const handleSaveEditProject = async () => {
    if (!editProject || !newProjectName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/projects/${editProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }

      const updatedProject: Project = await response.json();
      setProjects(projects.map(p => p.id === editProject.id ? updatedProject : p));
      setSelectedProject(updatedProject);
      setIsEditModalOpen(false);
      setEditProject(null);
      setNewProjectName('');
    } catch (e: any) {
      setError(e.message || 'Failed to update project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!editProject) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/projects/${editProject.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== editProject.id));
      setSelectedProject(projects.find(p => p.id !== editProject.id) || null);
      setIsEditModalOpen(false);
      setEditProject(null);
      setNewProjectName('');
    } catch (e: any) {
      setError(e.message || 'Failed to delete project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openNoteModal = (note: Note) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
    setMode('view');
  };

  const startEdit = () => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setMode('edit');
      setFormErrors({});
    }
  };

  return (
    <div className="app-container">
      <aside className="projects-sidebar">
        <h2>Projects</h2>
        <button onClick={() => setIsNewProjectModalOpen(true)}>New Project</button>
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
        {selectedProject && (
          <h1 className="project-title">{selectedProject.name}</h1>
        )}
        {selectedProject && (
          <button className="edit-project-btn" onClick={handleEditProjectClick}>Edit Project</button>
        )}
        <button className="new-note-btn" onClick={() => setIsNewNoteModalOpen(true)}>New Note</button>
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
                role="button"
                tabIndex={0}
              >
                <div className="note-content">
                  <h2>{note.title}</h2>
                  <p>{note.content}</p>
                </div>
                <button
                  className="view-button"
                  onClick={() => openNoteModal(note)}
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {isNewProjectModalOpen && (
        <div className="modal" onClick={() => setIsNewProjectModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Project name"
              disabled={isLoading}
            />
            <button
              className="save-btn"
              onClick={handleAddProject}
              disabled={isLoading || !newProjectName.trim()}
            >
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => setIsNewProjectModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && editProject && (
        <div className="modal" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Edit Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Project name"
              disabled={isLoading}
            />
            <button
              className="save-btn"
              onClick={handleSaveEditProject}
              disabled={isLoading || !newProjectName.trim()}
            >
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="delete-btn"
              onClick={handleDeleteProject}
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {isNewNoteModalOpen && (
        <div className="modal" onClick={() => setIsNewNoteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>New Note</h2>
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
            <button
              className="save-btn"
              onClick={handleAddNote}
              disabled={isLoading || !!formErrors.title || !!formErrors.content}
            >
              {isLoading ? 'Adding...' : 'Add Note'}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setIsNewNoteModalOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isNoteModalOpen && selectedNote && (
        <div className="modal" onClick={() => setIsNoteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            {mode === 'view' ? (
              <>
                <h2>{selectedNote.title}</h2>
                <p>{selectedNote.content}</p>
                <button className="edit-btn" onClick={startEdit} disabled={isLoading}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => deleteNote(selectedNote.id)} disabled={isLoading}>
                  Delete
                </button>
                <button className="cancel-btn" onClick={() => setIsNoteModalOpen(false)} disabled={isLoading}>
                  Close
                </button>
              </>
            ) : (
              <>
                <h2>Edit Note</h2>
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
                <button className="save-btn" onClick={handleUpdateNote} disabled={isLoading || !!formErrors.title || !!formErrors.content}>
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button className="cancel-btn" onClick={() => setMode('view')} disabled={isLoading}>
                  Cancel
                </button>
                <button className="delete-btn" onClick={() => deleteNote(selectedNote.id)} disabled={isLoading}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;