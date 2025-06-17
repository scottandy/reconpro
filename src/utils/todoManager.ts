import { Todo, CalendarEvent, TodoCategory, TodoSettings, TODO_CATEGORY_CONFIGS } from '../types/todo';

export class TodoManager {
  private static readonly STORAGE_KEYS = {
    TODOS: 'dealership_todos',
    CALENDAR_EVENTS: 'dealership_calendar_events',
    TODO_SETTINGS: 'dealership_todo_settings'
  };

  static initializeDefaultTodos(dealershipId: string): void {
    const existingTodos = this.getTodos(dealershipId);
    if (existingTodos.length > 0) return;

    const defaultTodos: Omit<Todo, 'id'>[] = [
      {
        title: 'Complete emissions inspection',
        description: 'Perform emissions testing on newly acquired vehicles',
        priority: 'high',
        status: 'pending',
        category: 'inspection',
        assignedTo: 'MW', // Mike Wilson
        assignedBy: 'JS', // John Smith
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        dueTime: '14:00',
        vehicleId: '1',
        vehicleName: '2023 Honda Accord',
        tags: ['emissions', 'inspection', 'priority'],
        notes: 'Check OBD2 codes before testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Order brake pads for Toyota Corolla',
        description: 'Front brake pads need replacement',
        priority: 'medium',
        status: 'pending',
        category: 'parts-order',
        assignedTo: 'SJ', // Sarah Johnson
        assignedBy: 'JS',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        vehicleId: '5',
        vehicleName: '2019 Toyota Corolla',
        tags: ['parts', 'brakes', 'urgent'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Schedule professional photography',
        description: 'Book photographer for completed vehicles',
        priority: 'medium',
        status: 'in-progress',
        category: 'photography',
        assignedTo: 'JS',
        assignedBy: 'JS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        tags: ['photography', 'marketing'],
        notes: 'Contact Elite Photography Services',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Follow up with customer on trade-in',
        description: 'Call customer about pending trade-in paperwork',
        priority: 'high',
        status: 'pending',
        category: 'customer-contact',
        assignedTo: 'SJ',
        assignedBy: 'JS',
        dueDate: new Date().toISOString().split('T')[0], // Today
        dueTime: '10:00',
        tags: ['customer', 'paperwork', 'trade-in'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        title: 'Weekly team meeting',
        description: 'Review progress and assign new tasks',
        priority: 'medium',
        status: 'pending',
        category: 'general',
        assignedTo: 'ALL',
        assignedBy: 'JS',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
        dueTime: '09:00',
        isRecurring: true,
        recurringPattern: 'weekly',
        tags: ['meeting', 'team', 'planning'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const todos = defaultTodos.map(todo => ({
      ...todo,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    this.saveTodos(dealershipId, todos);
  }

  static getTodos(dealershipId: string): Todo[] {
    const key = `${this.STORAGE_KEYS.TODOS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static saveTodos(dealershipId: string, todos: Todo[]): void {
    const key = `${this.STORAGE_KEYS.TODOS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(todos));
  }

  static addTodo(dealershipId: string, todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Todo {
    const todos = this.getTodos(dealershipId);
    const newTodo: Todo = {
      ...todoData,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    todos.unshift(newTodo);
    this.saveTodos(dealershipId, todos);

    // Create calendar event if due date is set
    if (newTodo.dueDate) {
      this.createCalendarEventFromTodo(dealershipId, newTodo);
    }

    return newTodo;
  }

  static updateTodo(dealershipId: string, todoId: string, updates: Partial<Todo>): Todo | null {
    const todos = this.getTodos(dealershipId);
    const index = todos.findIndex(todo => todo.id === todoId);
    
    if (index === -1) return null;

    const oldTodo = todos[index];
    todos[index] = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Mark completion time if status changed to completed
    if (updates.status === 'completed' && oldTodo.status !== 'completed') {
      todos[index].completedAt = new Date().toISOString();
      todos[index].completedBy = updates.completedBy || todos[index].assignedTo;
    }

    this.saveTodos(dealershipId, todos);

    // Update calendar event if due date changed
    if (updates.dueDate !== undefined || updates.dueTime !== undefined) {
      this.updateCalendarEventFromTodo(dealershipId, todos[index]);
    }

    return todos[index];
  }

  static deleteTodo(dealershipId: string, todoId: string): boolean {
    const todos = this.getTodos(dealershipId);
    const filteredTodos = todos.filter(todo => todo.id !== todoId);
    
    if (filteredTodos.length === todos.length) return false;

    this.saveTodos(dealershipId, filteredTodos);

    // Remove associated calendar event
    this.removeCalendarEventForTodo(dealershipId, todoId);

    return true;
  }

  static getTodosByUser(dealershipId: string, userInitials: string): Todo[] {
    const todos = this.getTodos(dealershipId);
    return todos.filter(todo => 
      todo.assignedTo === userInitials || 
      todo.assignedTo === 'ALL' ||
      todo.assignedBy === userInitials
    );
  }

  static getTodosByCategory(dealershipId: string, category: TodoCategory): Todo[] {
    return this.getTodos(dealershipId).filter(todo => todo.category === category);
  }

  static getTodosByVehicle(dealershipId: string, vehicleId: string): Todo[] {
    return this.getTodos(dealershipId).filter(todo => todo.vehicleId === vehicleId);
  }

  static getTodosByStatus(dealershipId: string, status: Todo['status']): Todo[] {
    return this.getTodos(dealershipId).filter(todo => todo.status === status);
  }

  static getTodosByPriority(dealershipId: string, priority: Todo['priority']): Todo[] {
    return this.getTodos(dealershipId).filter(todo => todo.priority === priority);
  }

  static getOverdueTodos(dealershipId: string): Todo[] {
    const todos = this.getTodos(dealershipId);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    return todos.filter(todo => {
      if (todo.status === 'completed' || todo.status === 'cancelled') return false;
      if (!todo.dueDate) return false;

      if (todo.dueDate < today) return true;
      if (todo.dueDate === today && todo.dueTime && todo.dueTime < currentTime) return true;

      return false;
    });
  }

  static getTodaysTodos(dealershipId: string): Todo[] {
    const todos = this.getTodos(dealershipId);
    const today = new Date().toISOString().split('T')[0];

    return todos.filter(todo => todo.dueDate === today);
  }

  static getUpcomingTodos(dealershipId: string, days: number = 7): Todo[] {
    const todos = this.getTodos(dealershipId);
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      return todo.dueDate >= todayStr && todo.dueDate <= futureDateStr;
    });
  }

  static searchTodos(dealershipId: string, query: string): Todo[] {
    const todos = this.getTodos(dealershipId);
    const searchTerm = query.toLowerCase();
    
    return todos.filter(todo => 
      todo.title.toLowerCase().includes(searchTerm) ||
      todo.description?.toLowerCase().includes(searchTerm) ||
      todo.vehicleName?.toLowerCase().includes(searchTerm) ||
      todo.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      todo.notes?.toLowerCase().includes(searchTerm)
    );
  }

  // Calendar Event Management
  static getCalendarEvents(dealershipId: string): CalendarEvent[] {
    const key = `${this.STORAGE_KEYS.CALENDAR_EVENTS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static saveCalendarEvents(dealershipId: string, events: CalendarEvent[]): void {
    const key = `${this.STORAGE_KEYS.CALENDAR_EVENTS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(events));
  }

  static createCalendarEventFromTodo(dealershipId: string, todo: Todo): CalendarEvent | null {
    if (!todo.dueDate) return null;

    const events = this.getCalendarEvents(dealershipId);
    
    // Remove existing event for this todo
    const filteredEvents = events.filter(event => event.todoId !== todo.id);

    const startDateTime = todo.dueTime 
      ? `${todo.dueDate}T${todo.dueTime}:00`
      : `${todo.dueDate}T09:00:00`;
    
    const endDateTime = todo.dueTime
      ? `${todo.dueDate}T${this.addHoursToTime(todo.dueTime, 1)}:00`
      : `${todo.dueDate}T10:00:00`;

    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: todo.title,
      description: todo.description,
      start: startDateTime,
      end: endDateTime,
      allDay: !todo.dueTime,
      type: 'todo',
      todoId: todo.id,
      assignedTo: todo.assignedTo,
      vehicleId: todo.vehicleId,
      vehicleName: todo.vehicleName,
      color: this.getPriorityColor(todo.priority),
      createdBy: todo.assignedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    filteredEvents.push(newEvent);
    this.saveCalendarEvents(dealershipId, filteredEvents);

    return newEvent;
  }

  static updateCalendarEventFromTodo(dealershipId: string, todo: Todo): void {
    this.createCalendarEventFromTodo(dealershipId, todo);
  }

  static removeCalendarEventForTodo(dealershipId: string, todoId: string): void {
    const events = this.getCalendarEvents(dealershipId);
    const filteredEvents = events.filter(event => event.todoId !== todoId);
    this.saveCalendarEvents(dealershipId, filteredEvents);
  }

  private static addHoursToTime(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  private static getPriorityColor(priority: Todo['priority']): string {
    const colors = {
      low: '#6B7280',
      medium: '#F59E0B',
      high: '#F97316',
      urgent: '#EF4444'
    };
    return colors[priority];
  }

  // Settings Management
  static getTodoSettings(dealershipId: string): TodoSettings {
    const key = `${this.STORAGE_KEYS.TODO_SETTINGS}_${dealershipId}`;
    const data = localStorage.getItem(key);
    
    if (data) {
      return JSON.parse(data);
    }

    // Default settings
    const defaultSettings: TodoSettings = {
      defaultPriority: 'medium',
      defaultCategory: 'general',
      autoAssignToSelf: true,
      enableNotifications: true,
      showCompletedTasks: false,
      defaultView: 'list',
      reminderMinutes: 15
    };

    this.saveTodoSettings(dealershipId, defaultSettings);
    return defaultSettings;
  }

  static saveTodoSettings(dealershipId: string, settings: TodoSettings): void {
    const key = `${this.STORAGE_KEYS.TODO_SETTINGS}_${dealershipId}`;
    localStorage.setItem(key, JSON.stringify(settings));
  }

  // Statistics
  static getTodoStats(dealershipId: string): {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    byCategory: Record<TodoCategory, number>;
    byPriority: Record<Todo['priority'], number>;
    byUser: Record<string, number>;
  } {
    const todos = this.getTodos(dealershipId);
    const overdueTodos = this.getOverdueTodos(dealershipId);
    
    const byCategory = Object.keys(TODO_CATEGORY_CONFIGS).reduce((acc, category) => {
      acc[category as TodoCategory] = todos.filter(todo => todo.category === category).length;
      return acc;
    }, {} as Record<TodoCategory, number>);

    const byPriority = {
      low: todos.filter(todo => todo.priority === 'low').length,
      medium: todos.filter(todo => todo.priority === 'medium').length,
      high: todos.filter(todo => todo.priority === 'high').length,
      urgent: todos.filter(todo => todo.priority === 'urgent').length
    };

    const byUser: Record<string, number> = {};
    todos.forEach(todo => {
      if (todo.assignedTo !== 'ALL') {
        byUser[todo.assignedTo] = (byUser[todo.assignedTo] || 0) + 1;
      }
    });

    return {
      total: todos.length,
      pending: todos.filter(todo => todo.status === 'pending').length,
      inProgress: todos.filter(todo => todo.status === 'in-progress').length,
      completed: todos.filter(todo => todo.status === 'completed').length,
      overdue: overdueTodos.length,
      byCategory,
      byPriority,
      byUser
    };
  }

  static getCategoryConfig(category: TodoCategory) {
    return TODO_CATEGORY_CONFIGS[category];
  }

  static formatDueDate(dueDate: string, dueTime?: string): string {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateStr = '';
    if (isToday) {
      dateStr = 'Today';
    } else if (isTomorrow) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
    
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      const timeStr = new Date(0, 0, 0, hours, minutes).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    }
    
    return dateStr;
  }
}