import { z } from 'zod';

/**
 * Zod schema for the WalletPostWalletRewardsCreditRequest model.
 * Defines the structure and validation rules for this data type.
 * This is the shape used in application code - what developers interact with.
 */
export const walletPostWalletRewardsCreditRequest = z.lazy(() => {
  return z.object({
    playerId: z.string(),
    amountMinor: z.number().gte(1),
    reason: z.string(),
    idempotencyKey: z.string(),
  });
});

/**
 * @typedef {WalletPostWalletRewardsCreditRequest} walletPostWalletRewardsCreditRequest
 * @property {string} playerId - Sandbox player ID, `P-1001` to `P-1005`.
 * @property {number} amountMinor - Amount in minor units (cents). Integer, at least 1.
 * @property {string} reason - Why the credit was issued (shown in the ledger).
 * @property {string} idempotencyKey - Unique key per credit. Replaying the same key returns the same result and never double-credits.
 */
export type WalletPostWalletRewardsCreditRequest = z.infer<
  typeof walletPostWalletRewardsCreditRequest
>;

/**
 * Zod schema for mapping API responses to the WalletPostWalletRewardsCreditRequest application shape.
 * Handles any property name transformations from the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const walletPostWalletRewardsCreditRequestResponse = z.lazy(() => {
  return z
    .object({
      player_id: z.string(),
      amount_minor: z.number().gte(1),
      reason: z.string(),
      idempotency_key: z.string(),
    })
    .transform((data) => ({
      playerId: data['player_id'],
      amountMinor: data['amount_minor'],
      reason: data['reason'],
      idempotencyKey: data['idempotency_key'],
    }));
});

/**
 * Zod schema for mapping the WalletPostWalletRewardsCreditRequest application shape to API requests.
 * Handles any property name transformations required by the API schema.
 * If property names match the API schema exactly, this is identical to the application shape.
 */
export const walletPostWalletRewardsCreditRequestRequest = z.lazy(() => {
  return z
    .object({
      playerId: z.string(),
      amountMinor: z.number().gte(1),
      reason: z.string(),
      idempotencyKey: z.string(),
    })
    .transform((data) => ({
      player_id: data['playerId'],
      amount_minor: data['amountMinor'],
      reason: data['reason'],
      idempotency_key: data['idempotencyKey'],
    }));
});
