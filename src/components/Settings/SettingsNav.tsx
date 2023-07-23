import { useCallback, useState } from 'react';
import AutoPlayToggle from './AutoPlayTwitch';
import { ThemeModeToggle } from './DarkModeToggle';
import SettingsDialog from './SettingsDialog';
import { nanoid } from 'nanoid';

export default function Settings() {
  const [uniqueKey, SetUniqueKey] = useState(() => nanoid());
  const remountSettingsDialog = useCallback(() => SetUniqueKey(nanoid()), []);
  return (
    <div className='absolute right-4 top-4 flex gap-2'>
      <AutoPlayToggle />
      <ThemeModeToggle />
      <SettingsDialog key={uniqueKey} onReset={remountSettingsDialog} />
    </div>
  );
}
