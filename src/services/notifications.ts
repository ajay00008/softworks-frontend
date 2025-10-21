// Notification Service for Real-time Alerts and Communication
export interface Notification {
  id: string;
  type: 'MISSING_SHEET' | 'ABSENT_STUDENT' | 'AI_CORRECTION_COMPLETE' | 'MANUAL_REVIEW_REQUIRED' | 'SYSTEM_ALERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ACKNOWLEDGED' | 'DISMISSED';
  title: string;
  message: string;
  recipientId: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
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

class NotificationService {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
    this.initializeWebSocket();
  }

  /**
   * Initialize WebSocket connection for real-time notifications
   */
  private initializeWebSocket() {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:4000/ws';
    this.wsConnection = new WebSocket(`${wsUrl}?token=${token}`);

    this.wsConnection.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        this.handleIncomingNotification(notification);
      } catch (error) {
        }
    };

    this.wsConnection.onclose = () => {
      this.attemptReconnect();
    };

    this.wsConnection.onerror = (error) => {
      };
  }

  /**
   * Attempt to reconnect WebSocket
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        `);
        this.initializeWebSocket();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Handle incoming real-time notification
   */
  private handleIncomingNotification(notification: Notification) {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new window.Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
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

      const response = await fetch(`${this.baseUrl}/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
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
   * Dismiss notification
   */
  async dismissNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/dismiss`, {
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
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
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
   * Close WebSocket connection
   */
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
