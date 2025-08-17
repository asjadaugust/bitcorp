'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

export function LanguageSwitcher() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <LanguageIcon sx={{ color: 'text.secondary' }} />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="language-select-label">{t('language')}</InputLabel>
        <Select
          labelId="language-select-label"
          value={locale}
          label={t('language')}
          onChange={(e) => handleLanguageChange(e.target.value)}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
        >
          <MenuItem value="en">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>🇺🇸</span>
              <Typography>{t('english')}</Typography>
            </Box>
          </MenuItem>
          <MenuItem value="es">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>🇪🇸</span>
              <Typography>{t('spanish')}</Typography>
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
