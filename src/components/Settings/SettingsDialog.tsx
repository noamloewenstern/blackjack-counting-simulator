import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useAutomationSettingsStore, useSettingsStore } from '~/stores/settingsStore';
import { useToast } from '~/components/ui/use-toast';

export default function SettingsDialog({ onReset }: { onReset: () => void }) {
  const { toast } = useToast();

  const [numberDecksInShoe, setNumberOfDecks, resetNumberDecks] = useSettingsStore(state => [
    state.numberDecksInShoe,
    state.setNumberOfDecks,
    state.reset,
  ]);
  const [intervalWaits, setIntervalWaits, resetTimeoutSettings] = useAutomationSettingsStore(state => [
    state.intervalWaits,
    state.setIntervalWaits,
    state.reset,
  ]);

  const [numberDecksInShoeTemp, setNumberOfDecksTemp] = useState(numberDecksInShoe);

  const [timeoutWaitSettingsTemp, setTimeoutSettingTemp] = useState(intervalWaits);

  const setTimeoutSettingByName = useCallback((name: keyof typeof intervalWaits, value: number) => {
    setTimeoutSettingTemp(state => ({ ...state, [name]: value }));
  }, []);

  const saveChanges = useCallback(() => {
    setNumberOfDecks(numberDecksInShoeTemp);
    setIntervalWaits(timeoutWaitSettingsTemp);
    toast({ title: 'Saved Changes' });
  }, [numberDecksInShoeTemp, setIntervalWaits, setNumberOfDecks, timeoutWaitSettingsTemp, toast]);

  const resetChanges = useCallback(() => {
    setNumberOfDecksTemp(numberDecksInShoe);
    setTimeoutSettingTemp(intervalWaits);
    resetNumberDecks();
    resetTimeoutSettings();
    onReset();

    toast({ title: 'Reset Changes' });
  }, [intervalWaits, numberDecksInShoe, onReset, resetNumberDecks, resetTimeoutSettings, toast]);

  const { betweenPlays, shuffleDeckBeforeNextDeal, splitHand, hitDealer, hitPlayer, playerAction } =
    timeoutWaitSettingsTemp;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Settings</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Make changes to game settings here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='numberOfDecks' className='text-right'>
              Number of Decks
            </Label>
            <Input
              id='numberOfDecks'
              type='number'
              value={numberDecksInShoeTemp}
              className='col-span-3'
              onChange={e => setNumberOfDecksTemp(+e.target.value)}
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='betweenPlays' className='text-right'>
              Between Plays
            </Label>
            <Input
              type='number'
              onChange={e => setTimeoutSettingByName('betweenPlays', +e.target.value)}
              id='betweenPlays'
              value={betweenPlays}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='shuffleDeckBeforeNextDeal' className='text-right'>
              Shuffle Deck
            </Label>
            <Input
              type='number'
              onChange={e => setTimeoutSettingByName('shuffleDeckBeforeNextDeal', +e.target.value)}
              id='shuffleDeckBeforeNextDeal'
              value={shuffleDeckBeforeNextDeal}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='splitHand' className='text-right'>
              Split Hand
            </Label>
            <Input
              type='number'
              onChange={e => setTimeoutSettingByName('splitHand', +e.target.value)}
              id='splitHand'
              value={splitHand}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='hitDealer' className='text-right'>
              Hit Dealer
            </Label>
            <Input
              type='number'
              onChange={e => setTimeoutSettingByName('hitDealer', +e.target.value)}
              id='hitDealer'
              value={hitDealer}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='hitPlayer' className='text-right'>
              Hit Player
            </Label>
            <Input
              type='number'
              onChange={e => setTimeoutSettingByName('hitPlayer', +e.target.value)}
              id='hitPlayer'
              value={hitPlayer}
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='playerAction' className='text-right'>
              Player Action
            </Label>
            <Input
              type='number'
              onChange={e => setTimeoutSettingByName('playerAction', +e.target.value)}
              id='playerAction'
              value={playerAction}
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit' onClick={saveChanges}>
            Save changes
          </Button>
          <Button onClick={resetChanges}>Reset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
