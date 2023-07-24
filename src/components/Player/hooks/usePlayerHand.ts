import { useContext } from 'react';
import { HandContext } from '../contexts/HandContext';

export default function usePlayerHand() {
  const handContext = useContext(HandContext);
  if (!handContext) {
    throw new Error('usePlayerHand must be a child within HandProvider');
  }
  return handContext;
}
