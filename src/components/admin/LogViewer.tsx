import {
  Activity,
  AlertTriangle,
  Bug,
  Database,
  Download,
  Filter,
  Globe,
  Info,
  Monitor,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { LogEntry, logger, LogLevel } from '../../utils/logger';

interface LogViewerProps {
  maxHeight?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ maxHeight = '600px' }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [stats, setStats] = useState<any>({});

  const refreshLogs = () => {
    const allLogs = logger.getLogs({ limit: 500 });
    setLogs(allLogs);
    setStats(logger.getLogStats());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoRefresh) {
      interval = setInterval(refreshLogs, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefresh]);

  useEffect(() => {
    let filtered = logs;

    // Filter by level
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(term) ||
        log.category.toLowerCase().includes(term) ||
        JSON.stringify(log.data || {}).toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedLevel, selectedCategory, searchTerm]);

  const logLevelOptions = [
    { value: 'ALL', label: 'All Levels', icon: Activity },
    { value: LogLevel.DEBUG, label: 'Debug', icon: Bug },
    { value: LogLevel.INFO, label: 'Info', icon: Info },
    { value: LogLevel.WARN, label: 'Warning', icon: AlertTriangle },
    { value: LogLevel.ERROR, label: 'Error', icon: Zap },
    { value: LogLevel.CRITICAL, label: 'Critical', icon: Zap },
  ];

  const categoryIcons: Record<string, React.ElementType> = {
    DATABASE: Database,
    AUTH: Shield,
    UI: Monitor,
    API: Globe,
    ADMIN: Shield,
    APP: Activity,
    SYSTEM: Monitor
  };

  const getLogLevelColor = (level: LogLevel): string => {
    const colors = {
      [LogLevel.DEBUG]: 'text-gray-400',
      [LogLevel.INFO]: 'text-blue-400',
      [LogLevel.WARN]: 'text-yellow-400',
      [LogLevel.ERROR]: 'text-red-400',
      [LogLevel.CRITICAL]: 'text-red-600'
    };
    return colors[level] || 'text-gray-400';
  };

  const getLogLevelBg = (level: LogLevel): string => {
    const colors = {
      [LogLevel.DEBUG]: 'bg-gray-900',
      [LogLevel.INFO]: 'bg-blue-900/20',
      [LogLevel.WARN]: 'bg-yellow-900/20',
      [LogLevel.ERROR]: 'bg-red-900/20',
      [LogLevel.CRITICAL]: 'bg-red-900/40'
    };
    return colors[level] || 'bg-gray-900';
  };

  const categories = useMemo(() => {
    const cats = new Set(['ALL']);
    logs.forEach(log => cats.add(log.category));
    return Array.from(cats);
  }, [logs]);

  const exportLogs = () => {
    const dataStr = logger.exportLogs();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gamesta-logs-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      refreshLogs();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-xl font-bold text-white">System Logs</h3>
            <p className="text-gray-300 text-sm">
              {filteredLogs.length} of {logs.length} logs
              {stats.sessionId && (
                <span className="ml-2 px-2 py-1 bg-purple-600 rounded text-xs">
                  Session: {stats.sessionId.slice(-8)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-3 py-2 rounded-lg transition-colors ${isAutoRefresh
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={refreshLogs}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportLogs}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={clearLogs}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats.byLevel && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.entries(stats.byLevel).map(([level, count]) => (
            <div key={level} className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-white">{String(count)}</div>
              <div className="text-sm text-gray-300">{level}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Filter className="w-4 h-4 inline mr-1" />
            Log Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {logLevelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search logs..."
            className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Logs Display */}
      <div
        className="bg-black/30 rounded-lg overflow-auto"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No logs found matching the current filters</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredLogs.map((log, index) => {
              const CategoryIcon = categoryIcons[log.category] || Activity;
              return (
                <div
                  key={`${log.timestamp}-${index}`}
                  className={`p-3 border-l-4 ${getLogLevelBg(log.level)} border-l-purple-500 hover:bg-white/5 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <CategoryIcon className={`w-4 h-4 ${getLogLevelColor(log.level)}`} />
                      <span className={`text-xs font-mono ${getLogLevelColor(log.level)}`}>
                        {LogLevel[log.level]}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        {log.category}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium">{log.message}</p>
                        <span className="text-xs text-gray-400 font-mono whitespace-nowrap ml-4">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>

                      {log.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                            Show data
                          </summary>
                          <pre className="mt-1 text-xs bg-black/40 p-2 rounded text-gray-300 overflow-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300">
                            Show stack trace
                          </summary>
                          <pre className="mt-1 text-xs bg-red-900/20 p-2 rounded text-red-300 overflow-auto">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
