import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IMarketsGetEventsUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const marketsGetEventsUnauthorizedResponseResponse = z.lazy(() => {
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

export class MarketsGetEventsUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): MarketsGetEventsUnauthorizedResponse {
    const error = new MarketsGetEventsUnauthorizedResponse(message, response);
    const result = marketsGetEventsUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof marketsGetEventsUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = MarketsGetEventsUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
