export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: TodoCategory;
  assignedTo: string; // User initials
  assignedBy: string; // User initials who created the task
  dueDate?: string; // ISO date string
  dueTime?: string; // HH:MM format
  vehicleId?: string; // Optional link to specific vehicle
  vehicleName?: string; // e.g., "2023 Honda Accord"
  tags?: string[];
  notes?: string;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  attachments?: TodoAttachment[];
}

export interface TodoAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'link';
  url: string;
  size?: number;
}

export type TodoCategory = 
  | 'inspection'
  | 'repair'
  | 'cleaning'
  | 'photography'
  | 'paperwork'
  | 'customer-contact'
  | 'parts-order'
  | 'scheduling'
  | 'follow-up'
  | 'general';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO datetime string
  end: string; // ISO datetime string
  allDay: boolean;
  type: 'todo' | 'appointment' | 'reminder' | 'deadline';
  todoId?: string; // Link to todo if applicable
  assignedTo?: string;
  vehicleId?: string;
  vehicleName?: string;
  location?: string;
  attendees?: string[];
  color?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoSettings {
  defaultPriority: Todo['priority'];
  defaultCategory: TodoCategory;
  autoAssignToSelf: boolean;
  enableNotifications: boolean;
  showCompletedTasks: boolean;
  defaultView: 'list' | 'kanban' | 'calendar';
  reminderMinutes: number;
}

export const TODO_CATEGORY_CONFIGS = {
  'inspection': {
    label: 'Inspection',
    description: 'Vehicle inspection tasks',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    icon: '🔍'
  },
  'repair': {
    label: 'Repair',
    description: 'Mechanical and body repair tasks',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    icon: '🔧'
  },
  'cleaning': {
    label: 'Cleaning',
    description: 'Detailing and cleaning tasks',
    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    icon: '✨'
  },
  'photography': {
    label: 'Photography',
    description: 'Vehicle photography tasks',
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    icon: '📸'
  },
  'paperwork': {
    label: 'Paperwork',
    description: 'Documentation and administrative tasks',
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600',
    icon: '📋'
  },
  'customer-contact': {
    label: 'Customer Contact',
    description: 'Customer communication tasks',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    icon: '📞'
  },
  'parts-order': {
    label: 'Parts Order',
    description: 'Parts ordering and procurement',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    icon: '📦'
  },
  'scheduling': {
    label: 'Scheduling',
    description: 'Appointment and scheduling tasks',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
    icon: '📅'
  },
  'follow-up': {
    label: 'Follow-up',
    description: 'Follow-up and reminder tasks',
    color: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
    icon: '🔄'
  },
  'general': {
    label: 'General',
    description: 'General tasks and reminders',
    color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600',
    icon: '📝'
  }
} as const;

export const PRIORITY_CONFIGS = {
  'low': {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:border-gray-600',
    icon: '⬇️'
  },
  'medium': {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
    icon: '➡️'
  },
  'high': {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
    icon: '⬆️'
  },
  'urgent': {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
    icon: '🚨'
  }
} as const;