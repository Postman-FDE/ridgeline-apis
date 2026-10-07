import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IMarketsGetEventsInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const marketsGetEventsInternalServerErrorResponseResponse = z.lazy(() => {
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

export class MarketsGetEventsInternalServerErrorResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): MarketsGetEventsInternalServerErrorResponse {
    const error = new MarketsGetEventsInternalServerErrorResponse(message, response);
    const result = marketsGetEventsInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof marketsGetEventsInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = MarketsGetEventsInternalServerErrorResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
