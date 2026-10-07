import { z } from 'zod';

/**
 * Zod schema for the WalletPostWalletBalanceRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const walletPostWalletBalanceRequest = z.lazy(() => {
  return z.object({
    playerId: z.string(),
  });
});

/**
 * @typedef {WalletPostWalletBalanceRequest} walletPostWalletBalanceRequest
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 */
export type WalletPostWalletBalanceRequest = z.infer<typeof walletPostWalletBalanceRequest>;

/**
 * Zod schema for mapping API responses to the WalletPostWalletBalanceRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const walletPostWalletBalanceRequestResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
    })
    .transform((data) => ({
      playerId: data['player_id'],
    }));
});

/**
 * Zod schema for mapping the WalletPostWalletBalanceRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const walletPostWalletBalanceRequestRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
    })
    .transform((data) => ({
      player_id: data['playerId'],
    }));
});
