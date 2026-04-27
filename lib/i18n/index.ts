import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './en';
import fr from './fr';
import ht from './ht';

export const i18n = new I18n({ en, fr, ht });
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export type Language = 'en' | 'fr' | 'ht';

export function setLanguage(lang: Language) {
  i18n.locale = lang;
}
