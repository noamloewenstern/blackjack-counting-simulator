import { AutoPlayToggle } from './AutoPlayTwitch';
import { ThemeModeToggle } from './DarkModeToggle';
import { SettingsDropdownMenu } from './SettingsDropdownMenu';

export default function Settings() {
  return (
    <div className='absolute right-4 top-4 flex gap-2'>
      <AutoPlayToggle />
      <ThemeModeToggle />
      <SettingsDropdownMenu />
    </div>
  );
}
