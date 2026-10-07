import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IWalletPostWalletBalanceNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const walletPostWalletBalanceNotFoundResponseResponse = z.lazy(() => {
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

export class WalletPostWalletBalanceNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): WalletPostWalletBalanceNotFoundResponse {
    const error = new WalletPostWalletBalanceNotFoundResponse(message, response);
    const result = walletPostWalletBalanceNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof walletPostWalletBalanceNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = WalletPostWalletBalanceNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
