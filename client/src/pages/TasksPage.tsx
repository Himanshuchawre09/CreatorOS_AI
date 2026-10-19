import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  api,
  TaskData,
  TaskStatus,
  CollaborationRequestData,
} from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-t-neutral-400 dark:border-t-neutral-600' },
  { id: 'doing', title: 'In Progress', color: 'border-t-blue-500' },
  { id: 'review', title: 'In Review', color: 'border-t-amber-500' },
  { id: 'done', title: 'Done', color: 'border-t-emerald-500' },
];

export const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [collaborations, setCollaborations] = useState<CollaborationRequestData[]>([]);
  const [selectedCollabId, setSelectedCollabId] = useState<string>('');
  const [tasks, setTasks] = useState<TaskData[]>([]);

  const [loadingCollabs, setLoadingCollabs] = useState<boolean>(true);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);

  // Fetch accepted collaborations
  const fetchCollaborations = useCallback(async () => {
    try {
      setLoadingCollabs(true);
      setError(null);
      const res = await api.getRequests({ status: 'accepted' });
      if (res.success && res.data) {
        setCollaborations(res.data);
        const queryCollab = searchParams.get('collaboration');
        if (queryCollab && res.data.some((c) => c._id === queryCollab)) {
          setSelectedCollabId(queryCollab);
        } else if (res.data.length > 0 && res.data[0]) {
          setSelectedCollabId(res.data[0]._id);
        }
      } else {
        setError(res.message || 'Failed to load collaborations');
      }
    } catch {
      setError('An error occurred while loading collaborations');
    } finally {
      setLoadingCollabs(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCollaborations();
  }, [fetchCollaborations]);

  // Selected collaboration object
  const activeCollaboration = useMemo(() => {
    return collaborations.find((c) => c._id === selectedCollabId) || null;
  }, [collaborations, selectedCollabId]);

  // Available assignees in the active collaboration
  const availableAssignees = useMemo(() => {
    if (!activeCollaboration) return [];
    const list: { id: string; name: string; role?: string }[] = [];
    if (activeCollaboration.sender) {
      list.push({
        id: activeCollaboration.sender._id,
        name: activeCollaboration.sender.name,
        role: activeCollaboration.sender.role,
      });
    }
    if (activeCollaboration.recipient) {
      list.push({
        id: activeCollaboration.recipient._id,
        name: activeCollaboration.recipient.name,
        role: activeCollaboration.recipient.role,
      });
    }
    return list;
  }, [activeCollaboration]);

  // Fetch tasks for the selected collaboration
  const fetchTasks = useCallback(async () => {
    if (!selectedCollabId) {
      setTasks([]);
      return;
    }
    try {
      setLoadingTasks(true);
      const res = await api.getTasks({ collaborationId: selectedCollabId });
      if (res.success && res.data) {
        setTasks(res.data);
      } else {
        toast.error(res.message || 'Failed to load tasks', 'Error');
      }
    } catch {
      toast.error('An error occurred while loading tasks', 'Error');
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedCollabId, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle switching collaboration
  const handleSelectCollaboration = (collabId: string) => {
    setSelectedCollabId(collabId);
    setSearchParams({ collaboration: collabId });
  };

  // Move task status
  const handleMoveStatus = async (task: TaskData, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );

      const res = await api.updateTask(task._id, { status: newStatus });
      if (!res.success) {
        // Revert on failure
        fetchTasks();
        toast.error(res.message || 'Failed to update task status', 'Error');
      }
    } catch {
      fetchTasks();
      toast.error('Failed to update task status', 'Error');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      const res = await api.deleteTask(taskId);
      if (res.success) {
        toast.success('Task removed', 'Success');
      } else {
        fetchTasks();
        toast.error(res.message || 'Failed to delete task', 'Error');
      }
    } catch {
      fetchTasks();
      toast.error('Failed to delete task', 'Error');
    }
  };

  // Create new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollabId || !newTaskTitle.trim() || !newTaskAssigneeId) {
      toast.warning('Please enter a task title and select an assignee', 'Missing fields');
      return;
    }

    try {
      setIsSubmittingTask(true);
      const res = await api.createTask({
        collaborationId: selectedCollabId,
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        assigneeId: newTaskAssigneeId,
        dueDate: newTaskDueDate || undefined,
        status: newTaskStatus,
      });

      if (res.success && res.data) {
        setTasks((prev) => [...prev, res.data!]);
        setIsModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueDate('');
        setNewTaskStatus('todo');
        toast.success('Task created successfully', 'Task Added');
      } else {
        toast.error(res.message || 'Failed to create task', 'Error');
      }
    } catch {
      toast.error('Failed to create task', 'Error');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-brand-500" />
            Workspace & Tasks
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Collaborative task board shared between brand and creator for accepted projects.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-3">
          {collaborations.length > 0 && (
            <>
              <div className="w-64">
                <Select
                  value={selectedCollabId}
                  onChange={(e) => handleSelectCollaboration(e.target.value)}
                  options={collaborations.map((c) => ({
                    value: c._id,
                    label: `${c.campaign?.title || 'Collaboration'} (${
                      c.sender._id === user?._id
                        ? c.recipient.name
                        : c.sender.name
                    })`,
                  }))}
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setNewTaskAssigneeId(availableAssignees[0]?.id || '');
                  setIsModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loadingCollabs ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-80 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 rounded-xl">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCollaborations}>
            Retry
          </Button>
        </div>
      ) : collaborations.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-8">
          <CheckSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No active collaborations yet
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Once a collaboration request is accepted by both parties, a dedicated workspace and Kanban board is created here.
          </p>
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col, colIdx) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-3 border-t-4 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/60 dark:border-neutral-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    {col.title}
                  </h3>
                  <Badge variant="neutral" className="text-xs px-2 py-0.5">
                    {colTasks.length}
                  </Badge>
                </div>

                {/* Task list */}
                <div className="space-y-3 min-h-[140px]">
                  {loadingTasks ? (
                    <div className="h-20 bg-white dark:bg-neutral-800/40 rounded-lg animate-pulse" />
                  ) : colTasks.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-xs italic">
                      No tasks in this column
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-lg p-3.5 shadow-xs space-y-2.5 hover:border-neutral-300 dark:hover:border-neutral-700 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
                            {task.title}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-neutral-400 hover:text-red-500 transition p-0.5"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                          {/* Assignee */}
                          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span className="font-medium text-xs truncate max-w-[100px]">
                              {task.assignee?.name || 'Unassigned'}
                            </span>
                          </div>

                          {/* Due Date */}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-neutral-500 text-xs">
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Move column controls */}
                        <div className="flex items-center justify-between pt-1">
                          {colIdx > 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveStatus(task, COLUMNS[colIdx - 1]!.id)
                              }
                              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center transition"
                            >
                              <ChevronLeft className="w-3 h-3 mr-0.5" />
                              {COLUMNS[colIdx - 1]!.title}
                            </button>
                          ) : (
                            <span />
                          )}

                          {colIdx < COLUMNS.length - 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveStatus(task, COLUMNS[colIdx + 1]!.id)
                              }
                              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center transition"
                            >
                              {COLUMNS[colIdx + 1]!.title}
                              <ChevronRight className="w-3 h-3 ml-0.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Create New Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Task Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Outline review video script"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <Textarea
                  placeholder="Add specific instructions, deliverables, or checklist..."
                  rows={3}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Assignee *
                  </label>
                  <Select
                    value={newTaskAssigneeId}
                    onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                    options={availableAssignees.map((a) => ({
                      value: a.id,
                      label: `${a.name} (${a.role || 'Member'})`,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Column
                  </label>
                  <Select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                    options={[
                      { value: 'todo', label: 'To Do' },
                      { value: 'doing', label: 'In Progress' },
                      { value: 'review', label: 'In Review' },
                      { value: 'done', label: 'Done' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingTask}
                >
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
