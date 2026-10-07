import {
  PlayerLimitsPostEligibilityCheckRequest,
  RidgelinePlayerLimits,
} from 'ridgeline-player-limits';

(async () => {
  const ridgelinePlayerLimits = new RidgelinePlayerLimits({
    token: 'YOUR_TOKEN',
  });

  const playerLimitsPostEligibilityCheckRequestProduct = 'sportsbook';

  const playerLimitsPostEligibilityCheckRequest: PlayerLimitsPostEligibilityCheckRequest = {
    playerId: 'player_id',
    product: playerLimitsPostEligibilityCheckRequestProduct,
    amountMinor: 9,
  };

  const data = await ridgelinePlayerLimits.playerLimits.playerLimitsPostEligibilityCheck(
    playerLimitsPostEligibilityCheckRequest,
  );

  console.log(data);
})();
