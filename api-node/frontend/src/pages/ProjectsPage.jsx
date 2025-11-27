import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/api';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  Users, 
  LogOut, 
  Search, 
  Sparkles,
  TrendingUp,
  Activity,
  X,
  Trash2,
  CheckCircle2,
  Pause,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [projectsWithIssues, setProjectsWithIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.get('/projects');
      const fetchedProjects = data.projects || [];
      setProjects(fetchedProjects);
      
      // Fetch issues count for each project
      const projectsWithIssueCounts = await Promise.all(
        fetchedProjects.map(async (project) => {
          try {
            const issuesData = await apiService.get(`/issues?project_id=${project.id}`);
            return {
              ...project,
              issuesCount: issuesData.issues?.length || 0
            };
          } catch (err) {
            console.error(`Error fetching issues for project ${project.id}:`, err);
            return { ...project, issuesCount: 0 };
          }
        })
      );
      
      setProjectsWithIssues(projectsWithIssueCounts);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/projects', formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
      // Refetch projects to update the list with issue counts
      await fetchProjects();
    } catch (err) {
      setError('Failed to create project');
      console.error('Error creating project:', err);
    }
  };

  const handleProjectClick = (project) => {
    navigate(`/projects/${project.id}/issues`);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await apiService.delete(`/projects/${projectToDelete.id}`);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setProjectsWithIssues(projectsWithIssues.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    }
  };

  const handleStatusChange = async (projectId, newStatus, event) => {
    event.stopPropagation();
    
    try {
      await apiService.put(`/projects/${projectId}`, { status: newStatus });
      
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      );
      setProjects(updatedProjects);
      
      const updatedProjectsWithIssues = projectsWithIssues.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      );
      setProjectsWithIssues(updatedProjectsWithIssues);
    } catch (err) {
      setError('Failed to update project status');
      console.error('Error updating status:', err);
    }
  };

  const filteredProjects = projectsWithIssues.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header con diseño moderno */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
                <FolderOpen className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
                <p className="text-sm text-slate-500">Manage your projects efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Barra de búsqueda mejorada */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
              </div>
              
              {/* Botón crear proyecto mejorado */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl active:scale-95 transition-all shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                New Project
              </button>
              
              {/* Usuario y logout */}
              <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border-2 border-slate-200/60 shadow-soft hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
              </div>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border-2 border-slate-200/60 shadow-soft hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-slate-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border-2 border-slate-200/60 shadow-soft hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-slate-900">
                  {projects.filter(p => {
                    const projectDate = new Date(p.created_at);
                    const now = new Date();
                    return projectDate.getMonth() === now.getMonth() && 
                           projectDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-slide-up">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Projects Grid o Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg mb-6">
              <FolderOpen className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'No projects match your search. Try a different keyword.' 
                : 'Get started by creating your first project and start tracking issues.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl active:scale-95 transition-all shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border-2 border-slate-200/60 hover:border-blue-400 hover:shadow-xl transition-all animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
                
                {/* Status dropdown */}
                <div className="mb-4">
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value, e)}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${
                      project.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300' 
                        : project.status === 'paused'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <option value="active">🟢 Active</option>
                    <option value="paused">⏸️ Paused</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                      <Calendar className="w-4 h-4 text-slate-600" strokeWidth={2} />
                    </div>
                    <span className="font-medium">{formatDate(project.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                      <FolderOpen className="w-4 h-4 text-blue-600" strokeWidth={2} />
                    </div>
                    <span className="font-bold text-blue-600">{project.issuesCount || 0} Issues</span>
                  </div>
                </div>
                
                {/* Click to view indicator */}
                <div 
                  className="mt-4 pt-4 border-t-2 border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
                    <span>View Issues</span>
                    <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal moderno para crear proyecto */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-8 py-6 bg-blue-600 border-b-4 border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Create New Project</h2>
                  <p className="text-blue-100 text-sm">Start tracking your issues today</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" strokeWidth={2} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-8">
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                  placeholder="e.g., Mobile App Redesign"
                />
              </div>
              
              <div className="mb-8">
                <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 resize-none"
                  placeholder="Describe what this project is about..."
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl active:scale-95 transition-all shadow-lg font-semibold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl animate-scale-in overflow-hidden">
            <div className="px-8 py-6 bg-red-600 border-b-4 border-red-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20">
                  <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Delete Project</h2>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-slate-700 mb-2">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{projectToDelete?.name}"</span>?
              </p>
              <p className="text-sm text-slate-600 mb-6">
                All issues associated with this project will also be deleted.
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setProjectToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl active:scale-95 transition-all shadow-lg font-semibold"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
