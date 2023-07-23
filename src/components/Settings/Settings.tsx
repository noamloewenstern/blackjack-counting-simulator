import AutoPlayToggle from './AutoPlayTwitch';
import { ThemeModeToggle } from './DarkModeToggle';
import SettingsDialog from './SettingsDialog';

export default function Settings() {
  return (
    <div className='absolute right-4 top-4 flex gap-2'>
      <AutoPlayToggle />
      <ThemeModeToggle />
      <SettingsDialog />
    </div>
  );
}
