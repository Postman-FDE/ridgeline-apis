import { RidgelinePromotions } from 'ridgeline-promotions';

(async () => {
  const ridgelinePromotions = new RidgelinePromotions({
    token: 'YOUR_TOKEN',
  });

  const data = await ridgelinePromotions.promotions.promotionsGetBoosts();

  console.log(data);
})();
