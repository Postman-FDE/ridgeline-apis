import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsPostBetsBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const betsPostBetsBadRequestResponseResponse = z.lazy(() => {
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

export class BetsPostBetsBadRequestResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsPostBetsBadRequestResponse {
    const error = new BetsPostBetsBadRequestResponse(message, response);
    const result = betsPostBetsBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsPostBetsBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsPostBetsBadRequestResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
