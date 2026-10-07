import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IMarketsGetMarketsBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const marketsGetMarketsBadRequestResponseResponse = z.lazy(() => {
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

export class MarketsGetMarketsBadRequestResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): MarketsGetMarketsBadRequestResponse {
    const error = new MarketsGetMarketsBadRequestResponse(message, response);
    const result = marketsGetMarketsBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof marketsGetMarketsBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = MarketsGetMarketsBadRequestResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
