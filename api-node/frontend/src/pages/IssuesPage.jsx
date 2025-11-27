import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiService from '../services/api';
import { 
  Plus, 
  ArrowLeft, 
  Filter, 
  Tag, 
  User, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
  X,
  Zap,
  Trash2,
  GripVertical
} from 'lucide-react';

const IssuesPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [issues, setIssues] = useState([]);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: '',
  });
  const [draggedIssue, setDraggedIssue] = useState(null);

  useEffect(() => {
    fetchProjectAndIssues();
  }, [projectId, filterStatus]);

  const fetchProjectAndIssues = async () => {
    try {
      setIsLoading(true);
      const [projectData, issuesData] = await Promise.all([
        apiService.get(`/projects/${projectId}`),
        apiService.get(`/issues?project_id=${projectId}${filterStatus !== 'all' ? `&status=${filterStatus}` : ''}`)
      ]);
      
      setProject(projectData.project);
      setIssues(issuesData.issues || []);
    } catch (err) {
      setError('Failed to load project or issues');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      const newIssue = await apiService.post('/issues', {
        ...formData,
        project_id: projectId,
      });
      setIssues([...issues, newIssue.issue]);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', priority: 'medium', assignee_id: '' });
    } catch (err) {
      setError('Failed to create issue');
      console.error('Error creating issue:', err);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const updatedIssue = await apiService.put(`/issues/${issueId}`, { status: newStatus });
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, ...updatedIssue.issue } : issue
      ));
    } catch (err) {
      console.error('Error updating issue:', err);
    }
  };

  const handleDeleteIssue = async (issueId, event) => {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this issue?')) {
      return;
    }
    
    try {
      await apiService.delete(`/issues/${issueId}`);
      setIssues(issues.filter(issue => issue.id !== issueId));
    } catch (err) {
      setError('Failed to delete issue');
      console.error('Error deleting issue:', err);
    }
  };

  const handleDragStart = (e, issue) => {
    setDraggedIssue(issue);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (draggedIssue && draggedIssue.status !== newStatus) {
      await handleStatusChange(draggedIssue.id, newStatus);
    }
    
    setDraggedIssue(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Clock className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'in_progress': return <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />;
      case 'done': return <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />;
      default: return <XCircle className="w-5 h-5 text-white" strokeWidth={2.5} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 ring-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 ring-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 ring-green-300';
      default: return 'bg-slate-100 text-slate-700 ring-slate-300';
    }
  };

  const issuesByStatus = {
    todo: issues.filter(issue => issue.status === 'todo'),
    in_progress: issues.filter(issue => issue.status === 'in_progress'),
    done: issues.filter(issue => issue.status === 'done'),
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-accent-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      {/* Header moderno con gradiente */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:scale-105 transition-all"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg shadow-accent-500/30">
                  <Zap className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project?.name}</h1>
                  <p className="text-sm text-slate-500">{project?.description || 'No description'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-accent-500 focus:bg-white focus:ring-4 focus:ring-accent-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Issues</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl active:scale-95 transition-all shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                New Issue
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tablero Kanban moderno */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl animate-slide-up">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(issuesByStatus).map(([status, statusIssues]) => {
            const columnColors = {
              todo: {
                bg: 'from-slate-100 to-slate-50',
                border: 'border-slate-300',
                iconBg: 'bg-slate-600',
                badge: 'bg-slate-100 text-slate-700',
                glow: 'shadow-slate-200'
              },
              in_progress: {
                bg: 'from-blue-100 to-blue-50',
                border: 'border-blue-300',
                iconBg: 'bg-blue-600',
                badge: 'bg-blue-100 text-blue-700',
                glow: 'shadow-blue-200'
              },
              done: {
                bg: 'from-green-100 to-green-50',
                border: 'border-green-300',
                iconBg: 'bg-green-600',
                badge: 'bg-green-100 text-green-700',
                glow: 'shadow-green-200'
              }
            };
            
            const colors = columnColors[status];
            
            return (
              <div key={status} className="animate-slide-up">
                <div className={`bg-gradient-to-b ${colors.bg} rounded-3xl border-2 ${colors.border} overflow-hidden shadow-soft`}>
                  {/* Header de columna */}
                  <div className="p-5 border-b-2 border-white/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.iconBg} shadow-lg ${colors.glow}`}>
                          {getStatusIcon(status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 capitalize text-lg">
                            {status.replace('_', ' ')}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium">{statusIssues.length} issues</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenedor de issues con scroll personalizado - Drop zone */}
                  <div 
                    className="p-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-hide min-h-[200px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    {statusIssues.map((issue, index) => (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue)}
                        className={`group bg-white/90 backdrop-blur-sm p-5 rounded-2xl border-2 border-white shadow-soft hover:shadow-xl hover:scale-[1.02] transition-all cursor-move animate-scale-in ${
                          draggedIssue?.id === issue.id ? 'opacity-50' : ''
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-2 mb-3">
                          <div className="mt-1 text-slate-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <h4 className="font-bold text-slate-900 text-base leading-snug flex-1 pr-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                            {issue.title}
                          </h4>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${getPriorityColor(issue.priority)} ring-2 ring-offset-2`}>
                            {issue.priority}
                          </span>
                          <button
                            onClick={(e) => handleDeleteIssue(issue.id, e)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete issue"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </div>
                        
                        {issue.description && (
                          <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                            {issue.description}
                          </p>
                        )}
                        
                        {issue.tags && issue.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {issue.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-accent-50 text-accent-700 ring-1 ring-accent-200"
                              >
                                <Tag className="w-3 h-3" strokeWidth={2.5} />
                                {tag}
                              </span>
                            ))}
                            {issue.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600">
                                +{issue.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100">
                              <Calendar className="w-3.5 h-3.5 text-slate-600" strokeWidth={2} />
                            </div>
                            {formatDate(issue.created_at)}
                          </div>
                          
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                            className="text-xs font-semibold border-2 border-slate-200 rounded-xl px-3 py-1.5 bg-white hover:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300 transition-all cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    
                    {statusIssues.length === 0 && (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/60 shadow-inner mb-3">
                          <XCircle className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                          No issues yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal moderno para crear issue */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-8 py-6 bg-purple-600 border-b-4 border-purple-800 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Create New Issue</h2>
                  <p className="text-purple-100 text-sm">Report a bug or request a feature</p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', description: '', priority: 'medium', assignee_id: '' });
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" strokeWidth={2} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateIssue} className="p-8">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                  placeholder="e.g., Bug: Login button not responding"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400 resize-none"
                  placeholder="Describe the issue in detail..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-bold text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer appearance-none font-semibold"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="assignee_id" className="block text-sm font-bold text-slate-700 mb-2">
                    Assignee (Optional)
                  </label>
                  <input
                    type="text"
                    id="assignee_id"
                    value={formData.assignee_id}
                    onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all placeholder:text-slate-400"
                    placeholder="User ID"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', description: '', priority: 'medium', assignee_id: '' });
                  }}
                  className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl active:scale-95 transition-all shadow-lg font-semibold"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
