import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IWalletPostWalletBalanceUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const walletPostWalletBalanceUnauthorizedResponseResponse = z.lazy(() => {
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

export class WalletPostWalletBalanceUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): WalletPostWalletBalanceUnauthorizedResponse {
    const error = new WalletPostWalletBalanceUnauthorizedResponse(message, response);
    const result = walletPostWalletBalanceUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof walletPostWalletBalanceUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = WalletPostWalletBalanceUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
