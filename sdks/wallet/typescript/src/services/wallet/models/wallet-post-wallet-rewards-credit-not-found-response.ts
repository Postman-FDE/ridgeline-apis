import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IWalletPostWalletRewardsCreditNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const walletPostWalletRewardsCreditNotFoundResponseResponse = z.lazy(() => {
  return z
    .object({
      error: z.string(),
      message: z.string(),
    })
    .transform((data) => ({
      error: data['error'],
      message: data['message'],
    }));
});

export class WalletPostWalletRewardsCreditNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): WalletPostWalletRewardsCreditNotFoundResponse {
    const error = new WalletPostWalletRewardsCreditNotFoundResponse(message, response);
    const result = walletPostWalletRewardsCreditNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof walletPostWalletRewardsCreditNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = WalletPostWalletRewardsCreditNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
