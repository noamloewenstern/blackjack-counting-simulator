import { getActionByStrategy, isSoftHand, getSplitAction } from './perfect-blackjack';

const settings = {
  allowedToDouble: true,
  allowedToDoubleAfterSplit: true,
  canDoubleAfterSplit: true,
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

  describe('split', () => {
    describe("agains dealer's 10", () => {
      const dealerCount = 10;
      it('shoud return Y', () => {
        const action = getSplitAction(['8', '8'], dealerCount, settings);
        expect(action).toEqual('Y');
      });
    });
  });
  describe('getActionByStrategy', () => {
    describe("agains dealer's 10", () => {
      const dealerCount = 10;
      it('Should Stand', () => {
        const action = getActionByStrategy(['9', 'T'], dealerCount, settings);
        expect(action).toEqual('S');
      });
      it('Should Hit', () => {
        const action = getActionByStrategy(['Q', '4'], dealerCount, settings);
        expect(action).toEqual('H');
      });
      it('Should Hit', () => {
        const action = getActionByStrategy(['4', '9'], dealerCount, settings);
        expect(action).toEqual('H');
      });
    });
    describe("agains dealer's 7", () => {
      const dealerCount = 7;
      it('Should Stand', () => {
        const action = getActionByStrategy(['5', 'K'], dealerCount, settings);
        expect(action).toEqual('H');
      });
    });
  });
});
