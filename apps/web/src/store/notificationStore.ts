import{create}from'zustand'
import{api}from'@/api/client'
interface NotificationState{unreadCount:number;fetchUnreadCount:()=>Promise<void>;markAllRead:()=>Promise<void>}
export const useNotificationStore=create<NotificationState>((set)=>({
  unreadCount:0,
  fetchUnreadCount:async()=>{try{const data=await api.get<{count:number}>('/notifications/unread-count');set({unreadCount:data.count})}catch{}},
  markAllRead:async()=>{await api.post('/notifications/read-all');set({unreadCount:0})},
}))
