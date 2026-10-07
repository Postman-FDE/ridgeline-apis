import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IMarketsGetEventsBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const marketsGetEventsBadRequestResponseResponse = z.lazy(() => {
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

export class MarketsGetEventsBadRequestResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): MarketsGetEventsBadRequestResponse {
    const error = new MarketsGetEventsBadRequestResponse(message, response);
    const result = marketsGetEventsBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof marketsGetEventsBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = MarketsGetEventsBadRequestResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
