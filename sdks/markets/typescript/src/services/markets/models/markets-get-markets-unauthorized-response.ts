import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IMarketsGetMarketsUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const marketsGetMarketsUnauthorizedResponseResponse = z.lazy(() => {
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

export class MarketsGetMarketsUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): MarketsGetMarketsUnauthorizedResponse {
    const error = new MarketsGetMarketsUnauthorizedResponse(message, response);
    const result = marketsGetMarketsUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof marketsGetMarketsUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = MarketsGetMarketsUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
