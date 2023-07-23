import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { useSettingsStore } from '~/stores/settingsStore';

export function AutoPlayToggle() {
  const { automateInteractivePlayer, toggleAutomateInteractivePlayer } = useSettingsStore();
  return (
    <div className='flex items-center space-x-2'>
      <Label htmlFor='auto-play-mode'>Auto Play</Label>
      <Switch
        id='auto-play-mode'
        checked={automateInteractivePlayer}
        onCheckedChange={toggleAutomateInteractivePlayer}
      />
    </div>
  );
}
