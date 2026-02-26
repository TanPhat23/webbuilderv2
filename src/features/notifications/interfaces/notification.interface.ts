export interface Notification {
  Id: string
  UserId: string
  Type: NotificationType
  Title: string
  Description: string
  Read: boolean
  CreatedAt: string
  UpdatedAt: string
}

export type NotificationType = 'message' | 'user' | 'alert' | 'settings'

export interface NotificationStats {
  total: number
  unread: number
  readToday: number
}

export interface NotificationFilterCounts {
  all: number
  unread: number
  messages: number
  followers: number
  alerts: number
  updates: number
}

export interface NotificationResponse {
  notifications: Notification[]
  stats: NotificationStats
  filterCounts: NotificationFilterCounts
}

export interface UpdateNotificationPayload {
  notificationId: string
  read: boolean
}

export interface NotificationFilters {
  filter?: string
  search?: string
}
