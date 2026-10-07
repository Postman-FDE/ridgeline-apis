import {
  GeoCompliancePostLocationCheckRequest,
  RidgelineGeoCompliance,
} from 'ridgeline-geo-compliance';

(async () => {
  const ridgelineGeoCompliance = new RidgelineGeoCompliance({
    token: 'YOUR_TOKEN',
  });

  const product = 'sportsbook';

  const geoCompliancePostLocationCheckRequest: GeoCompliancePostLocationCheckRequest = {
    playerId: 'player_id',
    product: product,
  };

  const data = await ridgelineGeoCompliance.geoCompliance.geoCompliancePostLocationCheck(
    geoCompliancePostLocationCheckRequest,
  );

  console.log(data);
})();
