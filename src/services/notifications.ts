import { io, Socket } from 'socket.io-client';

// Notification Service for Real-time Alerts and Communication
export interface Notification {
  id: string;
  type: 'MISSING_SHEET' | 'ABSENT_STUDENT' | 'AI_CORRECTION_COMPLETE' | 'MANUAL_REVIEW_REQUIRED' | 'SYSTEM_ALERT' | 'AI_PROCESSING_STARTED' | 'AI_PROCESSING_FAILED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'DISMISSED';
  title: string;
  message: string;
  recipientId: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
  acknowledgedAt?: string;
  dismissedAt?: string;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  status?: string;
  recipientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Global tracking to prevent duplicates across all instances (important for hot module reloading)
const globalProcessedNotificationIds: Set<string> = new Set();
let globalSocketInstance: Socket | null = null;
let globalNotificationServiceInstance: NotificationService | null = null;
let isNotificationListenerRegistered = false;

class NotificationService {
  private baseUrl: string;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    // Use import.meta.env for Vite instead of process.env
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    
    // Store this instance globally
    globalNotificationServiceInstance = this;
    
    this.initializeSocket();
  }

  /**
   * Initialize Socket.IO connection for real-time notifications
   */
  private initializeSocket() {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      return;
    }

    // Get current user info for logging
    let currentUserId = 'unknown';
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.sub || 'unknown';
      }
    } catch (e) {
      // Ignore parsing errors
    }

    // Determine socket URL - prioritize env var, fallback to current window location
    let apiUrl = import.meta.env.VITE_API_BASE_URL;
    
    // If no env var, try to determine from current window location (works when accessing via IP)
    if (!apiUrl && typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      const port = window.location.port || (protocol === 'https:' ? '443' : '80');
      
      // Extract backend URL from current location
      // If frontend is on port 5173, backend is likely on 4000
      // If frontend is on same port (production), backend is on same host
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Accessing via IP/domain
        const backendPort = port === '5173' ? '4000' : port;
        apiUrl = `${protocol}//${hostname}:${backendPort}/api`;
      } else {
        // Localhost fallback
        apiUrl = 'http://localhost:4000/api';
      }
      
      console.log('[SOCKET] 🔍 Auto-detected API URL from window location', {
        apiUrl,
        hostname,
        port,
        timestamp: new Date().toISOString()
      });
    }
    
    // Final fallback
    apiUrl = apiUrl || 'http://localhost:4000/api';
    const socketUrl = apiUrl.replace('/api', '') || 'http://localhost:4000';
    
    console.log('[SOCKET] 🔌 Initializing socket connection', {
      socketUrl,
      apiUrl,
      hasToken: !!token,
      userId: currentUserId,
      timestamp: new Date().toISOString()
    });
    
    // If there's already a connected socket instance, disconnect it first (prevent multiple connections)
    if (globalSocketInstance && globalSocketInstance.connected) {
      console.log('[SOCKET] 🔄 Disconnecting previous socket instance to prevent duplicates', {
        socketId: globalSocketInstance.id,
        timestamp: new Date().toISOString()
      });
      globalSocketInstance.removeAllListeners('notification'); // Remove only notification listeners
      globalSocketInstance.disconnect();
      globalSocketInstance = null;
      isNotificationListenerRegistered = false; // Reset flag so new socket can register listener
    }
    
    // Create new socket connection
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });
    globalSocketInstance = this.socket;

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      console.log('[SOCKET] ✅ Sender: User connecting (frontend)', {
        userId: currentUserId,
        socketId: this.socket?.id,
        timestamp: new Date().toISOString()
      });
    });

    // Register notification listener (will only be registered once per socket instance)
    // The global flag prevents duplicate registrations during hot module reloading
    if (!isNotificationListenerRegistered) {
      isNotificationListenerRegistered = true;
      this.socket.on('notification', (notification: Notification) => {
      // Get current user info from localStorage or auth context
      const token = localStorage.getItem('auth-token');
      let currentUserId = 'unknown';
      try {
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = payload.sub || 'unknown';
        }
      } catch (e) {
        // Ignore parsing errors
      }

      console.log('[SOCKET] 📥 Receiver: Notification received', {
        receiverUserId: currentUserId,
        notificationId: notification.id,
        notificationType: notification.type,
        notificationTitle: notification.title,
        recipientId: notification.recipientId,
        priority: notification.priority,
        timestamp: new Date().toISOString()
      });
      this.handleIncomingNotification(notification);
      });
      console.log('[SOCKET] 📝 Notification listener registered', {
        socketId: this.socket?.id,
        timestamp: new Date().toISOString()
      });
    } else {
      // Listener already exists - this should not happen with proper cleanup
      console.log('[SOCKET] ⚠️ Notification listener already exists on socket', {
        socketId: this.socket?.id,
        timestamp: new Date().toISOString()
      });
    }

    this.socket.on('disconnect', (reason) => {
      console.log('[SOCKET] ❌ Sender: User disconnecting (frontend)', {
        userId: currentUserId,
        reason,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', () => {
      // Silent reconnect attempts
    });

    this.socket.on('reconnect_error', () => {
      // Silent reconnect errors
    });

    this.socket.on('reconnect_failed', () => {
      // Silent reconnect failures
    });

    // Handle pong for connection health
    this.socket.on('pong', () => {
      // Silent pong
    });
  }

  /**
   * Send ping to check connection
   */
  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  /**
   * Handle incoming real-time notification
   */
  private handleIncomingNotification(notification: Notification) {
    // Prevent duplicate processing using global tracking (works across all instances)
    if (globalProcessedNotificationIds.has(notification.id)) {
      console.log('[SOCKET] ⚠️ Ignoring duplicate notification', {
        notificationId: notification.id,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Mark as processed globally
    globalProcessedNotificationIds.add(notification.id);

    // Get current user ID to verify this notification is for them
    const token = localStorage.getItem('auth-token');
    let currentUserId = null;
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = payload.sub;
      }
    } catch (e) {
      // Ignore parsing errors
    }

    // Only process if recipientId matches current user (prevent wrong recipients)
    if (notification.recipientId && currentUserId && notification.recipientId !== currentUserId) {
      console.log('[SOCKET] ⚠️ Ignoring notification - recipientId mismatch', {
        recipientId: notification.recipientId,
        currentUserId,
        notificationId: notification.id
      });
      // Remove from processed set since we're ignoring it
      globalProcessedNotificationIds.delete(notification.id);
      return;
    }

    // Emit custom event for components to listen to (only once per notification ID)
    window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id // Use same tag to prevent duplicate browser notifications
      });
    }

    // Clean up old processed IDs (keep only last 100 to prevent memory leak)
    if (globalProcessedNotificationIds.size > 100) {
      const idsArray = Array.from(globalProcessedNotificationIds);
      globalProcessedNotificationIds.clear();
      idsArray.slice(-50).forEach(id => globalProcessedNotificationIds.add(id));
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Get all notifications for current user
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      // Use generic notifications endpoint (works for all roles: admin, teacher, etc.)
      const response = await fetch(`${this.baseUrl}/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      // Handle different response formats
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : (data.data.notifications || []);
      }
      return data.notifications || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    if (!notificationId) {
      console.error('[SOCKET] ⚠️ Cannot mark as read - notification ID is missing', {
        notificationId,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    try {
      console.log('[SOCKET] 📤 Sender: Marking notification as read', {
        notificationId,
        endpoint: `${this.baseUrl}/notifications/${notificationId}/read`,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: 'POST', // Backend expects POST, not PATCH
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SOCKET] ⚠️ Failed to mark notification as read', {
          notificationId,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      console.log('[SOCKET] ✅ Successfully marked notification as read', {
        notificationId,
        timestamp: new Date().toISOString()
      });

      return response.ok;
    } catch (error) {
      console.error('[SOCKET] ⚠️ Error marking notification as read', {
        notificationId,
        error,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Acknowledge notification (for missing sheets, absent students)
   */
  async acknowledgeNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create notification for missing answer sheet
   */
  async createMissingSheetNotification(data: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    examId: string;
    examTitle: string;
    className: string;
    reason: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: 'MISSING_SHEET',
          priority: 'HIGH',
          title: 'Missing Answer Sheet',
          message: `${data.studentName} (Roll: ${data.rollNumber}) - ${data.examTitle}`,
          relatedEntityId: data.examId,
          relatedEntityType: 'exam',
          metadata: {
            studentName: data.studentName,
            rollNumber: data.rollNumber,
            examTitle: data.examTitle,
            className: data.className,
            reason: data.reason
          }
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create notification for absent student
   */
  async createAbsentStudentNotification(data: {
    studentId: string;
    studentName: string;
    rollNumber: string;
    examId: string;
    examTitle: string;
    className: string;
    reason: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: 'ABSENT_STUDENT',
          priority: 'MEDIUM',
          title: 'Student Absent',
          message: `${data.studentName} (Roll: ${data.rollNumber}) - ${data.examTitle}`,
          relatedEntityId: data.examId,
          relatedEntityType: 'exam',
          metadata: {
            studentName: data.studentName,
            rollNumber: data.rollNumber,
            examTitle: data.examTitle,
            className: data.className,
            reason: data.reason
          }
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create notification for AI correction completion
   */
  async createAICorrectionCompleteNotification(data: {
    examId: string;
    examTitle: string;
    processedSheets: number;
    averageConfidence: number;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: 'AI_CORRECTION_COMPLETE',
          priority: 'LOW',
          title: 'AI Correction Complete',
          message: `${data.examTitle} - ${data.processedSheets} sheets processed`,
          relatedEntityId: data.examId,
          relatedEntityType: 'exam',
          metadata: {
            examTitle: data.examTitle,
            processedSheets: data.processedSheets,
            averageConfidence: data.averageConfidence
          }
        })
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get notification count by status
   */
  async getNotificationCounts(): Promise<{
    unread: number;
    urgent: number;
    total: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/counts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification counts');
      }

      return await response.json();
    } catch (error) {
      return { unread: 0, urgent: 0, total: 0 };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete notification (hard delete)
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    if (!notificationId) {
      console.error('[SOCKET] ⚠️ Cannot delete - notification ID is missing', {
        notificationId,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    try {
      console.log('[SOCKET] 📤 Sender: Deleting notification', {
        notificationId,
        endpoint: `${this.baseUrl}/notifications/${notificationId}`,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SOCKET] ⚠️ Failed to delete notification', {
          notificationId,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      console.log('[SOCKET] ✅ Successfully deleted notification', {
        notificationId,
        timestamp: new Date().toISOString()
      });

      return response.ok;
    } catch (error) {
      console.error('[SOCKET] ⚠️ Error deleting notification', {
        notificationId,
        error,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Clear all notifications (soft delete - dismisses all)
   */
  async clearAllNotifications(): Promise<boolean> {
    try {
      console.log('[SOCKET] 📤 Sender: Clearing all notifications', {
        endpoint: `${this.baseUrl}/notifications/clear-all`,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(`${this.baseUrl}/notifications/clear-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[SOCKET] ⚠️ Failed to clear all notifications', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      console.log('[SOCKET] ✅ Successfully cleared all notifications', {
        timestamp: new Date().toISOString()
      });

      return response.ok;
    } catch (error) {
      console.error('[SOCKET] ⚠️ Error clearing all notifications', {
        error,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }

  /**
   * Close Socket.IO connection
   */
  disconnect() {
    if (this.socket) {
      const socketToDisconnect = this.socket;
      socketToDisconnect.removeAllListeners('notification');
      socketToDisconnect.disconnect();
      this.socket = null;
      if (globalSocketInstance === socketToDisconnect) {
        globalSocketInstance = null;
        isNotificationListenerRegistered = false; // Reset flag when disconnecting
      }
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Re-initialize socket (call this after login to connect with new token)
   */
  reinitializeSocket() {
    console.log('[SOCKET] 🔄 Re-initializing socket connection', {
      currentSocket: this.socket?.id,
      connected: this.socket?.connected,
      timestamp: new Date().toISOString()
    });
    
    // Disconnect existing socket if any
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Reset global instance
    if (globalSocketInstance === this.socket) {
      globalSocketInstance = null;
    }
    isNotificationListenerRegistered = false;
    
    // Reset reconnect attempts
    this.reconnectAttempts = 0;
    
    // Initialize new connection
    this.initializeSocket();
  }
}

// Ensure only one instance exists (singleton pattern)
export const notificationService = globalNotificationServiceInstance || new NotificationService();
export default notificationService;
