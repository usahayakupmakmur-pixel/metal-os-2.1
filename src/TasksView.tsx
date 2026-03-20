import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  MapPin, 
  Plus, 
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  Calendar,
  Scan
} from 'lucide-react';
import { TEAM_TASKS } from '../constants';
import { TeamTask } from '../types';
import GeospatialEngine from '../components/GeospatialEngine';

interface TasksViewProps {
  onOpenScanner?: () => void;
  pendingTaskId?: string | null;
}

const TasksView: React.FC<TasksViewProps> = ({ onOpenScanner, pendingTaskId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTask, setSelectedTask] = useState<TeamTask | null>(null);
  const [showMap, setShowMap] = useState(false);

  // Handle external task selection
  React.useEffect(() => {
    if (pendingTaskId) {
      const task = TEAM_TASKS.find(t => t.id === pendingTaskId);
      if (task) {
        setSelectedTask(task);
        setFilterStatus('ALL');
        setSearchQuery('');
      }
    }
  }, [pendingTaskId]);

  const filteredTasks = TEAM_TASKS.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'text-slate-400 bg-slate-400/10';
      case 'IN_PROGRESS': return 'text-blue-400 bg-blue-400/10';
      case 'REVIEW': return 'text-amber-400 bg-amber-400/10';
      case 'DONE': return 'text-emerald-400 bg-emerald-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-rose-500';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-amber-500';
      case 'LOW': return 'text-emerald-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Team Tasks</h1>
          <p className="text-sm text-slate-400">Manage and track community maintenance & operations</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowMap(!showMap)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <MapPin className={`w-5 h-5 ${showMap ? 'text-blue-400' : 'text-slate-400'}`} />
          </button>
          <button 
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-all border border-slate-700"
          >
            <Scan className="w-4 h-4" />
            <span>Scan Task</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-900/20">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task List */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${showMap ? 'hidden md:block md:w-1/2' : 'w-full'}`}>
          {filteredTasks.map((task, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                selectedTask?.id === task.id 
                  ? 'bg-slate-800 border-emerald-500/50 shadow-lg shadow-emerald-900/10' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1">
                  <AlertCircle className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                  <span className={`text-[10px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              
              <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                {task.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {task.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignedTo.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>
                {task.location && (
                  <div className="flex items-center gap-1 text-emerald-500/70">
                    <MapPin className="w-3 h-3" />
                    <span>{task.location.address}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p>No tasks found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Map View (Side by side on desktop, full on mobile if toggled) */}
        {showMap && (
          <div className="flex-1 h-full border-l border-slate-800 relative">
            <GeospatialEngine 
              center={selectedTask?.location ? { lat: selectedTask.location.lat, lng: selectedTask.location.lng } : { lat: -5.1188, lng: 105.3075 }}
              zoom={15}
              points={filteredTasks.filter(t => t.location).map(t => ({
                id: t.id,
                position: { lat: t.location!.lat, lng: t.location!.lng },
                title: t.title,
                type: 'TASK',
                data: t
              }))}
              onPointSelect={(point) => setSelectedTask(point.data)}
            />
            {/* Floating Task Detail Overlay on Map */}
            {selectedTask && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-6 right-6 left-6 md:left-auto md:w-80 p-4 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-[1000]"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-white">{selectedTask.title}</h4>
                  <button onClick={() => setSelectedTask(null)} className="text-slate-500 hover:text-white">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4">{selectedTask.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">Status</span>
                    <span className={`text-xs font-bold ${getStatusColor(selectedTask.status).split(' ')[0]}`}>
                      {selectedTask.status}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                    <span className="text-[10px] text-slate-500 block uppercase mb-1">Due Date</span>
                    <span className="text-xs font-bold text-white">{selectedTask.dueDate}</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all">
                  Update Progress
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
