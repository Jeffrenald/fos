import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:   true,
    shouldPlaySound:   true,
    shouldSetBadge:    false,
    shouldShowBanner:  true,
    shouldShowList:    true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const STREAK_ID = 'fos-streak-reminder';
const MISSED_ID = 'fos-missed-session';

interface NotifContent {
  streakTitle:  string;
  streakBody:   string;
  missedTitle:  string;
  missedBody:   string;
}

const CONTENT: Record<string, NotifContent> = {
  en: {
    streakTitle: '🔥 Keep your streak alive!',
    streakBody:  'You haven\'t trained yet today. Even 20 minutes counts — let\'s go!',
    missedTitle: 'Sak pase? Kouraj checked on you 👀',
    missedBody:  'No session logged today. Come back when you\'re ready — zero judgment.',
  },
  fr: {
    streakTitle: '🔥 Gardez votre série vivante !',
    streakBody:  'Vous n\'avez pas encore entraîné aujourd\'hui. Même 20 minutes comptent !',
    missedTitle: 'Sak pase ? Kouraj vous a vérifié 👀',
    missedBody:  'Aucune séance enregistrée. Revenez quand vous êtes prêt.',
  },
  ht: {
    streakTitle: '🔥 Kenbe streak ou vivan!',
    streakBody:  'Ou poko antrene jodi a. Menm 20 minit konte — ann ale!',
    missedTitle: 'Sak pase? Kouraj tcheke ou 👀',
    missedBody:  'Okenn sesyon jodi a. Tounen lè ou pare — san jijman.',
  },
};

export async function scheduleStreakReminder(language: string = 'en') {
  await Notifications.cancelScheduledNotificationAsync(STREAK_ID).catch(() => {});
  const c = CONTENT[language] ?? CONTENT.en;

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_ID,
    content: { title: c.streakTitle, body: c.streakBody },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19, minute: 0,
    },
  });
}

export async function scheduleMissedSession(language: string = 'en') {
  await Notifications.cancelScheduledNotificationAsync(MISSED_ID).catch(() => {});
  const c = CONTENT[language] ?? CONTENT.en;

  await Notifications.scheduleNotificationAsync({
    identifier: MISSED_ID,
    content: { title: c.missedTitle, body: c.missedBody },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21, minute: 0,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
