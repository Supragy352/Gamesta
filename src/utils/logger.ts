// Comprehensive logging system for Gamesta
// Supports multiple log levels, formatting, and persistence

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
  userId?: string;
  sessionId: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStoredLogs: number;
  categories: string[];
}

class GamestaLogger {
  private config: LoggerConfig;
  private sessionId: string;
  private logs: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStoredLogs: 1000,
      categories: ['APP', 'DATABASE', 'AUTH', 'UI', 'API', 'ADMIN'],
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.loadStoredLogs();

    // Log system initialization
    this.info('SYSTEM', 'Gamesta Logger initialized', {
      config: this.config,
      sessionId: this.sessionId
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private getLogLevelName(level: LogLevel): string {
    return LogLevel[level];
  }

  private getLogLevelEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.CRITICAL]: '🚨'
    };
    return emojis[level] || 'ℹ️';
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    category: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: this.formatTimestamp(),
      level,
      category: category.toUpperCase(),
      message,
      data,
      stack: error?.stack,
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId
    };
  }
  private getCurrentUserId(): string | undefined {
    try {
      // Try to get user ID from a safer source without exposing auth tokens
      // First check if there's a logged user indicator in localStorage (without token data)
      const userSession = localStorage.getItem('gamesta_user_session');
      if (userSession) {
        const parsed = JSON.parse(userSession);
        return parsed?.userId;
      }

      // Fallback: Return 'anonymous' for public logs without exposing sensitive data
      return 'anonymous';
    } catch (error) {
      // Silently fail if we can't get user ID
      return 'anonymous';
    }
  }

  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, category, message, data, error);

    // Add to internal log storage
    this.logs.push(entry);
    this.maintainLogSize();

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Local storage
    if (this.config.enableStorage) {
      this.logToStorage();
    }

    // Remote logging (if enabled)
    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const emoji = this.getLogLevelEmoji(entry.level);
    const levelName = this.getLogLevelName(entry.level);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    const prefix = `${emoji} [${timestamp}] [${entry.category}] [${levelName}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data || '', entry.stack || '');
        break;
    }
  }

  private logToStorage(): void {
    try {
      const recentLogs = this.logs.slice(-this.config.maxStoredLogs);
      localStorage.setItem('gamesta_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error);
    }
  }

  private loadStoredLogs(): void {
    try {
      const stored = localStorage.getItem('gamesta_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error);
      this.logs = [];
    }
  }

  private maintainLogSize(): void {
    if (this.logs.length > this.config.maxStoredLogs) {
      this.logs = this.logs.slice(-this.config.maxStoredLogs);
    }
  }
  private logToRemote(entry: LogEntry): void {
    // TODO: Implement remote logging to Supabase or external service
    // This could send logs to a dedicated logs table or external monitoring service
    // For now, this is a placeholder that accepts the entry parameter
    console.debug('Remote logging not yet implemented for:', entry.category);
  }

  // Public logging methods
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  critical(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.CRITICAL, category, message, data, error);
  }

  // Utility methods
  getLogs(options: {
    level?: LogLevel;
    category?: string;
    limit?: number;
    since?: Date;
  } = {}): LogEntry[] {
    let filtered = [...this.logs];

    if (options.level !== undefined) {
      filtered = filtered.filter(log => log.level >= options.level!);
    } if (options.category) {
      filtered = filtered.filter(log => log.category === options.category!.toUpperCase());
    }

    if (options.since) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= options.since!);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered.reverse(); // Most recent first
  }

  getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    sessionId: string;
  } {
    const byLevel: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    this.logs.forEach(log => {
      const levelName = this.getLogLevelName(log.level);
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      sessionId: this.sessionId
    };
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('gamesta_logs');
    this.info('SYSTEM', 'All logs cleared');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.info('SYSTEM', `Log level changed to ${this.getLogLevelName(level)}`);
  }

  // Performance logging helpers
  startTimer(category: string, operation: string): () => void {
    const startTime = performance.now();
    const timerId = `${category}_${operation}_${Date.now()}`;

    this.debug(category, `Started: ${operation}`, { timerId, startTime });

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.info(category, `Completed: ${operation}`, {
        timerId,
        duration: `${duration.toFixed(2)}ms`,
        startTime,
        endTime
      });
    };
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, success: boolean, data?: any, error?: Error): void {
    const message = `Database ${operation} on ${table}: ${success ? 'SUCCESS' : 'FAILED'}`;

    if (success) {
      this.info('DATABASE', message, { operation, table, data });
    } else {
      this.error('DATABASE', message, error, { operation, table, data });
    }
  }

  // Authentication logging
  logAuthEvent(event: string, success: boolean, userId?: string, error?: Error): void {
    const message = `Auth ${event}: ${success ? 'SUCCESS' : 'FAILED'}`;

    if (success) {
      this.info('AUTH', message, { event, userId });
    } else {
      this.error('AUTH', message, error, { event, userId });
    }
  }

  // UI interaction logging
  logUIEvent(component: string, action: string, data?: any): void {
    this.debug('UI', `${component}: ${action}`, data);
  }

  // API call logging
  logAPICall(url: string, method: string, status: number, duration?: number, error?: Error): void {
    const message = `API ${method} ${url}: ${status}`;

    if (status >= 200 && status < 400) {
      this.info('API', message, { method, url, status, duration });
    } else {
      this.error('API', message, error, { method, url, status, duration });
    }
  }
}

// Create singleton instance
export const logger = new GamestaLogger({
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemote: false
});

// Global error handler
window.addEventListener('error', (event) => {
  logger.critical('SYSTEM', 'Unhandled error', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    message: event.message
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.critical('SYSTEM', 'Unhandled promise rejection', undefined, {
    reason: event.reason
  });
});

export default logger;
