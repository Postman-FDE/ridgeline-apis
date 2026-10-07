import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IWalletPostWalletRewardsCreditInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const walletPostWalletRewardsCreditInternalServerErrorResponseResponse = z.lazy(() => {
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

export class WalletPostWalletRewardsCreditInternalServerErrorResponse extends ThrowableError {
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
  ): WalletPostWalletRewardsCreditInternalServerErrorResponse {
    const error = new WalletPostWalletRewardsCreditInternalServerErrorResponse(message, response);
    const result =
      walletPostWalletRewardsCreditInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof walletPostWalletRewardsCreditInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = WalletPostWalletRewardsCreditInternalServerErrorResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
