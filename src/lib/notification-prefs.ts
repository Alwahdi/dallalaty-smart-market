const KEY = 'pref-notifications';
export const NOTIF_PREF_EVENT = 'notification-preference-change';

/** Whether the user allows in-app/push notification alerts on this device. */
export const notificationsEnabled = () => localStorage.getItem(KEY) !== 'off';

export const setNotificationsEnabled = (on: boolean) => {
  localStorage.setItem(KEY, on ? 'on' : 'off');
  window.dispatchEvent(new Event(NOTIF_PREF_EVENT));
};
