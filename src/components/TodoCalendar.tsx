import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TodoManager } from '../utils/todoManager';
import { Todo, TodoCategory, TODO_CATEGORY_CONFIGS, PRIORITY_CONFIGS } from '../types/todo';
import { 
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Car,
  Tag,
  X,
  Edit3,
  Trash2,
  Play,
  Check,
  BarChart3,
  List,
  Grid3X3,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  TrendingUp,
  Archive
} from 'lucide-react';

interface TodoModalProps {
  todo?: Todo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  availableUsers: string[];
  availableVehicles: Array<{id: string, name: string}>;
}

const TodoModal: React.FC<TodoModalProps> = ({ 
  todo, 
  isOpen, 
  onClose, 
  onSave, 
  availableUsers, 
  availableVehicles 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    category: 'general' as TodoCategory,
    assignedTo: user?.initials || '',
    dueDate: '',
    dueTime: '',
    vehicleId: '',
    vehicleName: '',
    tags: [] as string[],
    notes: ''
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description || '',
        priority: todo.priority,
        category: todo.category,
        assignedTo: todo.assignedTo,
        dueDate: todo.dueDate || '',
        dueTime: todo.dueTime || '',
        vehicleId: todo.vehicleId || '',
        vehicleName: todo.vehicleName || '',
        tags: todo.tags || [],
        notes: todo.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        assignedTo: user?.initials || '',
        dueDate: '',
        dueTime: '',
        vehicleId: '',
        vehicleName: '',
        tags: [],
        notes: ''
      });
    }
    setErrors({});
  }, [todo, isOpen, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.assignedTo.trim()) newErrors.assignedTo = 'Assignee is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const todoData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      dueDate: formData.dueDate || undefined,
      dueTime: formData.dueTime || undefined,
      vehicleId: formData.vehicleId || undefined,
      vehicleName: formData.vehicleName || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      notes: formData.notes.trim() || undefined,
      status: 'pending' as const,
      assignedBy: user?.initials || 'Unknown'
    };

    onSave(todoData);
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    setFormData(prev => ({
      ...prev,
      vehicleId,
      vehicleName: vehicle?.name || ''
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/20">
        <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {todo ? 'Edit Task' : 'Create New Task'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {todo ? 'Update task details' : 'Add a new task to your todo list'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Optional task description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(PRIORITY_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {Object.entries(TODO_CATEGORY_CONFIGS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign To *
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.assignedTo ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select assignee</option>
                <option value="ALL">Everyone</option>
                {availableUsers.map(userInitials => (
                  <option key={userInitials} value={userInitials}>
                    {userInitials}
                  </option>
                ))}
              </select>
              {errors.assignedTo && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.assignedTo}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Time
                </label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleInputChange('dueTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link to Vehicle
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">No vehicle selected</option>
                {availableVehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200/60 dark:border-gray-700/60">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
            >
              {todo ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TodoCalendar: React.FC = () => {
  const { dealership, user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Todo['status'] | 'all' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Todo['priority'] | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Available users and vehicles for dropdowns
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (dealership) {
      TodoManager.initializeDefaultTodos(dealership.id);
      loadTodos();
      loadAvailableData();
    }
  }, [dealership]);

  useEffect(() => {
    filterTodos();
  }, [todos, searchTerm, statusFilter, priorityFilter, categoryFilter, assigneeFilter]);

  const loadTodos = () => {
    if (dealership) {
      const allTodos = TodoManager.getTodos(dealership.id);
      setTodos(allTodos);
    }
  };

  const loadAvailableData = () => {
    // Load available users (mock data for now)
    const users = ['JS', 'SJ', 'MW', 'LD', 'TB']; // From auth demo data
    setAvailableUsers(users);

    // Load available vehicles (mock data for now)
    const vehicles = [
      { id: '1', name: '2023 Honda Accord' },
      { id: '2', name: '2022 Ford F-150' },
      { id: '3', name: '2021 Tesla Model 3' },
      { id: '4', name: '2020 Chevrolet Camaro' },
      { id: '5', name: '2019 Toyota Corolla' }
    ];
    setAvailableVehicles(vehicles);
  };

  const filterTodos = () => {
    let filtered = todos;

    // Search filter
    if (searchTerm) {
      filtered = TodoManager.searchTodos(dealership?.id || '', searchTerm);
    }

    // Status filter
    if (statusFilter === 'overdue') {
      filtered = filtered.filter(todo => {
        if (!todo.dueDate || todo.status === 'completed') return false;
        const now = new Date();
        const dueDate = new Date(todo.dueDate);
        if (todo.dueTime) {
          const [hours, minutes] = todo.dueTime.split(':').map(Number);
          dueDate.setHours(hours, minutes);
        }
        return dueDate < now;
      });
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(todo => todo.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(todo => todo.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(todo => todo.category === categoryFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      if (assigneeFilter === 'me') {
        filtered = filtered.filter(todo => todo.assignedTo === user?.initials);
      } else {
        filtered = filtered.filter(todo => todo.assignedTo === assigneeFilter);
      }
    }

    // Sort by priority and due date
    filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredTodos(filtered);
  };

  const handleAddTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dealership) {
      TodoManager.addTodo(dealership.id, todoData);
      loadTodos();
      setShowAddModal(false);
    }
  };

  const handleEditTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (dealership && editingTodo) {
      TodoManager.updateTodo(dealership.id, editingTodo.id, todoData);
      loadTodos();
      setEditingTodo(null);
    }
  };

  const handleDeleteTodo = (todo: Todo) => {
    if (dealership && window.confirm(`Are you sure you want to delete "${todo.title}"?`)) {
      TodoManager.deleteTodo(dealership.id, todo.id);
      loadTodos();
    }
  };

  const handleStatusChange = (todo: Todo, newStatus: Todo['status']) => {
    if (dealership) {
      const updates: Partial<Todo> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completedBy = user?.initials;
      }
      TodoManager.updateTodo(dealership.id, todo.id, updates);
      loadTodos();
    }
  };

  const formatDueDate = (dueDate: string, dueTime?: string) => {
    return TodoManager.formatDueDate(dueDate, dueTime);
  };

  const isOverdue = (todo: Todo) => {
    if (!todo.dueDate || todo.status === 'completed') return false;
    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    if (todo.dueTime) {
      const [hours, minutes] = todo.dueTime.split(':').map(Number);
      dueDate.setHours(hours, minutes);
    }
    return dueDate < now;
  };

  const isToday = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate === today;
  };

  const getTodoStats = () => {
    if (!dealership) return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    return TodoManager.getTodoStats(dealership.id);
  };

  const stats = getTodoStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOBILE OPTIMIZED: Much smaller header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Todo & Calendar</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">Manage tasks and deadlines</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Add Task</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* MOBILE OPTIMIZED: Compact stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <List className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Done</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Overdue</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.overdue}</p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE OPTIMIZED: Compact search and filters */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 transition-colors duration-300">
        {/* Search and View Toggle Row */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1 ${
              showFilters 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priority</option>
              <option value="urgent">🚨 Urgent</option>
              <option value="high">⬆️ High</option>
              <option value="medium">➡️ Medium</option>
              <option value="low">⬇️ Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {Object.entries(TODO_CATEGORY_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Assignees</option>
              <option value="me">My Tasks</option>
              {availableUsers.map(userInitials => (
                <option key={userInitials} value={userInitials}>
                  {userInitials}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2 sm:space-y-3">
        {filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => {
            const categoryConfig = TODO_CATEGORY_CONFIGS[todo.category];
            const priorityConfig = PRIORITY_CONFIGS[todo.priority];
            const overdueStatus = isOverdue(todo);
            const todayStatus = todo.dueDate && isToday(todo.dueDate);
            
            return (
              <div 
                key={todo.id}
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                  overdueStatus 
                    ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' 
                    : todayStatus
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10'
                      : 'border-white/30 dark:border-gray-700/30'
                }`}
              >
                <div className="p-3 sm:p-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTodo(todo)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges Row */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                      <span>{priorityConfig.icon}</span>
                      <span className="hidden sm:inline">{priorityConfig.label}</span>
                    </span>
                    
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                      <span>{categoryConfig.icon}</span>
                      <span className="hidden sm:inline">{categoryConfig.label}</span>
                    </span>

                    {todo.assignedTo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600">
                        <User className="w-3 h-3" />
                        <span>{todo.assignedTo}</span>
                      </span>
                    )}

                    {todo.vehicleName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium border border-indigo-200 dark:border-indigo-700">
                        <Car className="w-3 h-3" />
                        <span className="hidden sm:inline">{todo.vehicleName}</span>
                        <span className="sm:hidden">Vehicle</span>
                      </span>
                    )}

                    {overdueStatus && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-700">
                        <AlertTriangle className="w-3 h-3" />
                        OVERDUE
                      </span>
                    )}

                    {todayStatus && !overdueStatus && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-700">
                        <Clock className="w-3 h-3" />
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Due Date and Status Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {todo.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDueDate(todo.dueDate, todo.dueTime)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {todo.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(todo, 'in-progress')}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span className="hidden sm:inline">Start</span>
                        </button>
                      )}
                      
                      {todo.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusChange(todo, 'completed')}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span className="hidden sm:inline">Complete</span>
                        </button>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        todo.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700'
                          : todo.status === 'in-progress'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700'
                      }`}>
                        {todo.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {todo.status === 'in-progress' && <Play className="w-3 h-3" />}
                        {todo.status === 'pending' && <Clock className="w-3 h-3" />}
                        <span className="hidden sm:inline capitalize">{todo.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                      {todo.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                        >
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                      {todo.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs">
                          +{todo.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20 p-8 sm:p-12 text-center transition-colors duration-300">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Tasks Found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || assigneeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first task to get started with task management.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && categoryFilter === 'all' && assigneeFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Todo Modal */}
      <TodoModal
        todo={editingTodo || undefined}
        isOpen={showAddModal || !!editingTodo}
        onClose={() => {
          setShowAddModal(false);
          setEditingTodo(null);
        }}
        onSave={editingTodo ? handleEditTodo : handleAddTodo}
        availableUsers={availableUsers}
        availableVehicles={availableVehicles}
      />
    </div>
  );
};

export default TodoCalendar;