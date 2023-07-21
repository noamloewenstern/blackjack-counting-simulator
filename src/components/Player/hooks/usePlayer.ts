import { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';

export default function usePlayer() {
  const player = useContext(PlayerContext);
  if (!player) {
    throw new Error('usePlayer must be a child within a PlayerProvider');
  }
  return player;
}
