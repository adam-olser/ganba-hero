// Mock for @notifee/react-native on web
const notifee = {
  createChannel: async () => 'default',
  createTriggerNotification: async () => {},
  cancelAllNotifications: async () => {},
  displayNotification: async () => {},
};

export const TriggerType = { TIMESTAMP: 0, INTERVAL: 1 };
export const AndroidImportance = { HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 };

export default notifee;
