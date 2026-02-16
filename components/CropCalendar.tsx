import React, { useState, useEffect } from 'react';
import { CropCalendar as CropCalendarType, CalendarTask, CropStage, Crop } from '../types';
import { CropCalendarApi } from '../client_api/crops/calendarService';
import { CropsApi } from '../client_api/crops/service';
import { WeatherApi } from '../client_api/weather/service';
import { useAuth } from '../contexts/AuthContext';
import { i18n, Language } from '../utils/i18n';

const CropCalendar: React.FC = () => {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<CropCalendarType[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<CropCalendarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'tasks' | 'stages'>('timeline');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterStage, setFilterStage] = useState<CropStage | 'all'>('all');
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [taskNotes, setTaskNotes] = useState('');
  const [currentLang, setCurrentLang] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    loadCalendars();
  }, []);

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setCurrentLang(e.detail);
    };
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) window.lucide.createIcons();
  }, [loading, selectedCalendar, viewMode, editingTask, currentLang]);

  const loadCalendars = async () => {
    setLoading(true);
    const userId = user?.userId || 'u123';
    const cropsRes = await CropsApi.getByUser(userId);
    
    if (cropsRes.success && cropsRes.data) {
      const weatherRes = await WeatherApi.getForLocation(user?.location.village || 'Nashik');
      const weatherData = weatherRes.success ? weatherRes.data : undefined;

      const calendarPromises = cropsRes.data.map(async (crop) => {
        // Use planting date or default to 30 days ago
        const plantingDate = crop.plantingDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const calendarRes = await CropCalendarApi.generateCalendar(crop, plantingDate, weatherData);
        return calendarRes.success ? calendarRes.data : null;
      });

      const calendarResults = await Promise.all(calendarPromises);
      const validCalendars = calendarResults.filter(c => c !== null) as CropCalendarType[];
      setCalendars(validCalendars);
      
      if (validCalendars.length > 0) {
        setSelectedCalendar(validCalendars[0]);
      }
    }
    
    setLoading(false);
  };

  const toggleTaskCompletion = async (task: CalendarTask) => {
    if (!selectedCalendar) return;

    const updatedTask = {
      ...task,
      isCompleted: !task.isCompleted,
      completedDate: !task.isCompleted ? new Date().toISOString() : undefined,
      notes: task.notes || ''
    };

    const result = await CropCalendarApi.updateTask(selectedCalendar.cropId, task.id, updatedTask);
    
    if (result.success) {
      const updatedCalendar = {
        ...selectedCalendar,
        tasks: selectedCalendar.tasks.map(t => t.id === task.id ? updatedTask : t)
      };
      setSelectedCalendar(updatedCalendar);
      setCalendars(calendars.map(c => c.cropId === selectedCalendar.cropId ? updatedCalendar : c));
    }
  };

  const saveTaskNotes = async () => {
    if (!editingTask || !selectedCalendar) return;

    const updatedTask = {
      ...editingTask,
      notes: taskNotes
    };

    const result = await CropCalendarApi.updateTask(selectedCalendar.cropId, editingTask.id, updatedTask);
    
    if (result.success) {
      const updatedCalendar = {
        ...selectedCalendar,
        tasks: selectedCalendar.tasks.map(t => t.id === editingTask.id ? updatedTask : t)
      };
      setSelectedCalendar(updatedCalendar);
      setCalendars(calendars.map(c => c.cropId === selectedCalendar.cropId ? updatedCalendar : c));
      setEditingTask(null);
      setTaskNotes('');
    }
  };

  const getTaskUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStageName = (stage: any) => {
    if (currentLang === 'mr') return stage.nameMr || stage.name;
    if (currentLang === 'hi') return stage.nameHi || stage.name;
    return stage.name;
  };

  const getTaskTitle = (task: CalendarTask) => {
    if (currentLang === 'mr') return task.titleMr || task.title;
    if (currentLang === 'hi') return task.titleHi || task.title;
    return task.title;
  };

  const filteredTasks = selectedCalendar?.tasks.filter(task => {
    if (filterUrgency !== 'all' && task.urgency !== filterUrgency) return false;
    if (filterStage !== 'all' && task.stage !== filterStage) return false;
    return true;
  }) || [];

  const upcomingTasks = filteredTasks
    .filter(t => !t.isCompleted && new Date(t.dueDate) >= new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 10);

  const overdueTasks = filteredTasks
    .filter(t => !t.isCompleted && new Date(t.dueDate) < new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-6"></div>
        <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Crop Calendars...</p>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i data-lucide="calendar" className="w-8 h-8 text-slate-400"></i>
        </div>
        <p className="text-slate-500 font-medium">No crops found. Add crops to generate calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Crop Management Calendar</h1>
          <p className="text-slate-500 font-medium mt-2">Stage-wise farming tasks and recommendations</p>
        </div>
        <div className="flex items-center space-x-3">
          {calendars.map(cal => (
            <button
              key={cal.cropId}
              onClick={() => setSelectedCalendar(cal)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                selectedCalendar?.cropId === cal.cropId
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cal.cropType} - {cal.cropVariety}
            </button>
          ))}
        </div>
      </header>

      {selectedCalendar && (
        <>
          {/* Progress Overview */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  {selectedCalendar.cropType} - {selectedCalendar.cropVariety}
                </h2>
                <p className="text-slate-600 font-medium">
                  Current Stage: {getStageName(selectedCalendar.stages.find(s => s.stage === selectedCalendar.currentStage) || selectedCalendar.stages[0])}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-emerald-600 mb-1">{selectedCalendar.progress}%</div>
                <div className="text-sm font-bold text-slate-600">Progress</div>
              </div>
            </div>
            <div className="w-full bg-white/50 h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-1000"
                style={{ width: `${selectedCalendar.progress}%` }}
              ></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-600">
              <span>Sowing: {new Date(selectedCalendar.sowingDate).toLocaleDateString()}</span>
              <span>Expected Harvest: {new Date(selectedCalendar.expectedHarvestDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-xl">
            {[
              { id: 'timeline', label: 'Timeline', icon: 'calendar' },
              { id: 'stages', label: 'Growth Stages', icon: 'layers' },
              { id: 'tasks', label: 'Tasks', icon: 'check-square' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                  viewMode === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                <i data-lucide={tab.icon} className="w-4 h-4"></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6">Growth Timeline</h3>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-slate-200"></div>
                
                <div className="space-y-8">
                  {selectedCalendar.stages.map((stage, idx) => {
                    const isCurrent = stage.stage === selectedCalendar.currentStage;
                    const isPast = selectedCalendar.stages.findIndex(s => s.stage === selectedCalendar.currentStage) > idx;
                    
                    return (
                      <div key={idx} className="relative flex items-start space-x-6">
                        {/* Stage Marker */}
                        <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                          isCurrent ? 'bg-emerald-600 text-white scale-110' :
                          isPast ? 'bg-emerald-400 text-white' :
                          'bg-slate-200 text-slate-500'
                        }`}>
                          <i data-lucide={stage.icon} className="w-8 h-8"></i>
                        </div>
                        
                        {/* Stage Info */}
                        <div className={`flex-1 p-6 rounded-2xl border-2 ${
                          isCurrent ? 'bg-emerald-50 border-emerald-300' :
                          isPast ? 'bg-slate-50 border-slate-200' :
                          'bg-white border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xl font-black text-slate-900">{getStageName(stage)}</h4>
                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                              isCurrent ? 'bg-emerald-600 text-white' :
                              isPast ? 'bg-emerald-400 text-white' :
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {isCurrent ? 'Current' : isPast ? 'Completed' : 'Upcoming'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium mb-4">
                            {currentLang === 'mr' ? stage.descriptionMr : currentLang === 'hi' ? stage.descriptionHi : stage.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs font-bold text-slate-500">
                            <span>Duration: {stage.duration} days</span>
                            <span>Tasks: {selectedCalendar.tasks.filter(t => t.stage === stage.stage).length}</span>
                          </div>
                          
                          {/* Benefits */}
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Key Benefits</div>
                            <div className="flex flex-wrap gap-2">
                              {(currentLang === 'mr' ? stage.benefitsMr : currentLang === 'hi' ? stage.benefitsHi : stage.benefits).map((benefit, i) => (
                                <div key={i} className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-slate-700">
                                  ✓ {benefit}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stages View */}
          {viewMode === 'stages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCalendar.stages.map((stage, idx) => {
                const stageTasks = selectedCalendar.tasks.filter(t => t.stage === stage.stage);
                const completedTasks = stageTasks.filter(t => t.isCompleted).length;
                const isCurrent = stage.stage === selectedCalendar.currentStage;
                
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border-2 ${
                      isCurrent ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className={`w-16 h-16 ${stage.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <i data-lucide={stage.icon} className="w-8 h-8"></i>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">{getStageName(stage)}</h4>
                    <p className="text-sm text-slate-600 font-medium mb-4">
                      {currentLang === 'mr' ? stage.descriptionMr : currentLang === 'hi' ? stage.descriptionHi : stage.description}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-4">
                      <span>{stage.duration} days</span>
                      <span>{completedTasks}/{stageTasks.length} tasks</span>
                    </div>
                    {isCurrent && (
                      <div className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase text-center">
                        Current Stage
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tasks View */}
          {viewMode === 'tasks' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4">
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Filter by Urgency</label>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value as any)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Filter by Stage</label>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value as any)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Stages</option>
                    {selectedCalendar.stages.map(s => (
                      <option key={s.stage} value={s.stage}>{getStageName(s)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Overdue Tasks */}
              {overdueTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-red-600 mb-4 flex items-center space-x-2">
                    <i data-lucide="alert-triangle" className="w-5 h-5"></i>
                    <span>Overdue Tasks ({overdueTasks.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {overdueTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTaskCompletion}
                        onEdit={setEditingTask}
                        getTaskTitle={getTaskTitle}
                        getUrgencyColor={getTaskUrgencyColor}
                        currentLang={currentLang}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Tasks */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">Upcoming Tasks</h3>
                <div className="space-y-3">
                  {upcomingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskCompletion}
                      onEdit={setEditingTask}
                      getTaskTitle={getTaskTitle}
                      getUrgencyColor={getTaskUrgencyColor}
                      currentLang={currentLang}
                    />
                  ))}
                </div>
              </div>

              {/* Completed Tasks */}
              {filteredTasks.filter(t => t.isCompleted).length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-4">Completed Tasks</h3>
                  <div className="space-y-3">
                    {filteredTasks
                      .filter(t => t.isCompleted)
                      .map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={toggleTaskCompletion}
                          onEdit={setEditingTask}
                          getTaskTitle={getTaskTitle}
                          getUrgencyColor={getTaskUrgencyColor}
                          currentLang={currentLang}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Task Edit Modal */}
          {editingTask && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setEditingTask(null)}></div>
              <div className="relative bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
                <h3 className="text-2xl font-black text-slate-900 mb-6">{getTaskTitle(editingTask)}</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2 block">Notes</label>
                    <textarea
                      value={taskNotes}
                      onChange={(e) => setTaskNotes(e.target.value)}
                      placeholder="Add notes about this task..."
                      rows={4}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {editingTask.recommendations && editingTask.recommendations.length > 0 && (
                    <div>
                      <div className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Recommendations</div>
                      <ul className="space-y-2">
                        {(currentLang === 'mr' ? editingTask.recommendationsMr : currentLang === 'hi' ? editingTask.recommendationsHi : editingTask.recommendations)?.map((rec, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm text-slate-600">
                            <i data-lucide="check-circle" className="w-4 h-4 text-emerald-600 mt-0.5"></i>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {editingTask.weatherDependent && editingTask.weatherCondition && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">Weather Dependent</div>
                      <div className="text-sm font-bold text-blue-700">{editingTask.weatherCondition}</div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setEditingTask(null);
                      setTaskNotes('');
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveTaskNotes}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

interface TaskCardProps {
  task: CalendarTask;
  onToggle: (task: CalendarTask) => void;
  onEdit: (task: CalendarTask) => void;
  getTaskTitle: (task: CalendarTask) => string;
  getUrgencyColor: (urgency: string) => string;
  currentLang: Language;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, getTaskTitle, getUrgencyColor, currentLang }) => {
  const isOverdue = !task.isCompleted && new Date(task.dueDate) < new Date();
  const isDueSoon = !task.isCompleted && new Date(task.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  return (
    <div className={`p-6 rounded-2xl border-2 ${
      task.isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' :
      isOverdue ? 'bg-red-50 border-red-300' :
      isDueSoon ? 'bg-orange-50 border-orange-300' :
      'bg-white border-slate-200'
    }`}>
      <div className="flex items-start space-x-4">
        <button
          onClick={() => onToggle(task)}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
            task.isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 text-transparent'
          }`}
        >
          <i data-lucide="check" className="w-4 h-4"></i>
        </button>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${task.color} rounded-xl flex items-center justify-center`}>
                <i data-lucide={task.icon} className="w-5 h-5"></i>
              </div>
              <div>
                <h4 className={`text-base font-black ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {getTaskTitle(task)}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${getUrgencyColor(task.urgency)}`}>
                    {task.urgency}
                  </span>
                  {isOverdue && (
                    <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-black uppercase">
                      Overdue
                    </span>
                  )}
                  {isDueSoon && !isOverdue && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs font-black uppercase">
                      Due Soon
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onEdit(task)}
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <i data-lucide="edit-2" className="w-4 h-4"></i>
            </button>
          </div>
          
          <p className="text-sm text-slate-600 font-medium mb-3">
            {currentLang === 'mr' ? task.descriptionMr : currentLang === 'hi' ? task.descriptionHi : task.description}
          </p>
          
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            {task.weatherDependent && (
              <span className="flex items-center space-x-1 text-blue-600">
                <i data-lucide="cloud" className="w-3 h-3"></i>
                <span>Weather Dependent</span>
              </span>
            )}
          </div>
          
          {task.notes && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Notes</div>
              <div className="text-sm text-slate-700 font-medium">{task.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;
