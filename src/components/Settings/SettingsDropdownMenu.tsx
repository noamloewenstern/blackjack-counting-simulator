import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useAutomationSettingsStore } from '~/stores/settingsStore';

// type Checked = DropdownMenuCheckboxItemProps['checked'];

export function SettingsDropdownMenu() {
  const [automateInteractivePlayer, toggleAutomateInteractivePlayer] = useAutomationSettingsStore(state => [
    state.isOn,
    state.toggle,
  ]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Settings</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={automateInteractivePlayer} onCheckedChange={toggleAutomateInteractivePlayer}>
          Toggle Auto Play
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
