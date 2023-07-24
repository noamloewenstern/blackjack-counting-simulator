import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { useAutomationSettingsStore } from '~/stores/settingsStore';

export default function AutoPlayToggle() {
  const [automateInteractivePlayer, toggleAutomateInteractivePlayer] = useAutomationSettingsStore(state => [
    state.isOn,
    state.toggle,
  ]);
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
