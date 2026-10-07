import { RidgelineMarkets } from 'ridgeline-markets';

(async () => {
  const ridgelineMarkets = new RidgelineMarkets({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelineMarkets.markets.marketsGetEvents();

  console.log(data);
})();
