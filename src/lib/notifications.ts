import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  /**
   * Request notification permissions from the user.
   */
  static async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifications: Permissions requested (Web Mock)');
      return true;
    }

    try {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display === 'granted') return true;

      const request = await LocalNotifications.requestPermissions();
      return request.display === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedules notifications for upcoming festivals from the database.
   * Limits to the next 50 notifications to stay within OS limits.
   */
  static async scheduleFestivalReminders(database: Record<string, any>) {
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifications: Festival reminders scheduling mocked for Web');
      return;
    }

    try {
      // Clear all existing pending notifications to refresh the list
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const notifications: any[] = [];
      let idCounter = 1000;
      const now = new Date();

      Object.entries(database).forEach(([dateKey, data]) => {
        if (data.observances && data.observances.length > 0) {
          const [year, month, day] = dateKey.split('-').map(Number);
          const festivalDate = new Date(year, month - 1, day, 8, 0, 0); // 8:00 AM

          if (festivalDate > now && notifications.length < 50) {
            notifications.push({
              id: idCounter++,
              title: 'Tibetan Sacred Day',
              body: data.observances.join(', '),
              largeBody: `Today is a special occasion: ${data.observances.join(', ')}. Elements: ${data.elements}.`,
              schedule: { at: festivalDate },
              sound: 'beep.wav',
              smallIcon: 'ic_stat_calendar', // Ensure this exists in Android resources
              actionTypeId: 'OPEN_CALENDAR'
            });
          }
        }
      });

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} festival notifications.`);
      }
    } catch (error) {
      console.error('Failed to schedule festival notifications:', error);
    }
  }

  /**
   * Schedule a personal reminder for a specific date.
   */
  static async schedulePersonalReminder(dateKey: string, note?: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log(`Notifications: Personal reminder scheduled for ${dateKey} (Mock)`);
      return;
    }

    try {
      const id = this.generateId(dateKey);
      const [year, month, day] = dateKey.split('-').map(Number);
      const reminderDate = new Date(year, month - 1, day, 9, 0, 0); // 9:00 AM

      if (reminderDate < new Date()) return;

      await LocalNotifications.schedule({
        notifications: [{
          id,
          title: 'Tibetan Lunar Calendar Reminder',
          body: note || 'You set a reminder for today.',
          schedule: { at: reminderDate },
          actionTypeId: 'OPEN_CALENDAR'
        }]
      });
    } catch (error) {
      console.error('Failed to schedule personal reminder:', error);
    }
  }

  /**
   * Cancel a specific personal reminder.
   */
  static async cancelReminder(dateKey: string) {
    if (!Capacitor.isNativePlatform()) {
      console.log(`Notifications: Personal reminder cancelled for ${dateKey} (Mock)`);
      return;
    }

    try {
      const id = this.generateId(dateKey);
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
    }
  }

  /**
   * Generate a stable numeric ID from a date string for notification tracking.
   */
  private static generateId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
