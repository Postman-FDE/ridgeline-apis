import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IWalletPostWalletRewardsCreditUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const walletPostWalletRewardsCreditUnauthorizedResponseResponse = z.lazy(() => {
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

export class WalletPostWalletRewardsCreditUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(
    message: string,
    response?: unknown,
  ): WalletPostWalletRewardsCreditUnauthorizedResponse {
    const error = new WalletPostWalletRewardsCreditUnauthorizedResponse(message, response);
    const result = walletPostWalletRewardsCreditUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof walletPostWalletRewardsCreditUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = WalletPostWalletRewardsCreditUnauthorizedResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
