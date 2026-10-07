import { RidgelineWallet, WalletPostWalletBalanceRequest } from 'ridgeline-wallet';

(async () => {
  const ridgelineWallet = new RidgelineWallet({
    token: 'YOUR_TOKEN',
  });

  const walletPostWalletBalanceRequest: WalletPostWalletBalanceRequest = {
    playerId: 'player_id',
  };

  const data = await ridgelineWallet.wallet.walletPostWalletBalance(walletPostWalletBalanceRequest);

  console.log(data);
})();
