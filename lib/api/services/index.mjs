import markets from './markets.mjs';
import wallet from './wallet.mjs';
import promotions from './promotions.mjs';
import playerLimits from './player-limits.mjs';
import bets from './bets.mjs';
import geo from './geo-compliance.mjs';
import admin from './admin.mjs';

export const services = { markets, wallet, promotions, 'player-limits': playerLimits, bets, 'geo-compliance': geo, admin };
