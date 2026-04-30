import { ref, push, serverTimestamp } from 'firebase/database';
import { rtdb } from './firebase';

export type LogType = 'edit' | 'delete' | 'system' | 'login' | 'user' | 'alert' | 'win' | 'feedback' | 'notification';

export async function recordLog(user: string, type: LogType, action: string, target: string) {
  try {
    const logsRef = ref(rtdb, 'logs');
    await push(logsRef, {
      user,
      type,
      action,
      target,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to record log:', error);
  }
}
