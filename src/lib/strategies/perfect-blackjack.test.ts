import { ActionSettings, getActionByStrategy, isSoftHand } from './perfect-blackjack';

const settings: ActionSettings = {
  canDouble: true,
  allowedToDoubleAfterSplit: true,
};
describe('Perfect Blackjack', () => {
  describe('isSoftHand', () => {
    it('should return correct softHand 3,A', () => {
      const isSoft = isSoftHand(['3', 'A']);
      expect(isSoft).toEqual(true);
    });
    it('should return not softHand Q,4', () => {
      const isSoft = isSoftHand(['Q', '4']);
      expect(isSoft).toEqual(false);
    });
  });

  describe('getActionByStrategy', () => {
    describe("agains dealer's 10", () => {
      const dealerCount = 10;
      it('9,T should return S', () => {
        const action = getActionByStrategy(['9', 'T'], dealerCount, settings);
        expect(action).toEqual('S');
      });
    });
  });
});
