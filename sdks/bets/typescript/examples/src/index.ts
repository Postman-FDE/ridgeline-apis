import { RidgelineBets } from 'ridgeline-bets';

(async () => {
  const ridgelineBets = new RidgelineBets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineBets.bets.betsGetBets({
    playerId: 'player_id',
  });

  console.log(data);
})();
