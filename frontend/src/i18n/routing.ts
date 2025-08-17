import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Only show the default locale in the URL when users are on a different locale
  localePrefix: {
    mode: 'as-needed',
  },
});
