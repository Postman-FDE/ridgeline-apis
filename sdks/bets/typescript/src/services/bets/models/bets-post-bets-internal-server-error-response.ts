import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IBetsPostBetsInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const betsPostBetsInternalServerErrorResponseResponse = z.lazy(() => {
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

export class BetsPostBetsInternalServerErrorResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): BetsPostBetsInternalServerErrorResponse {
    const error = new BetsPostBetsInternalServerErrorResponse(message, response);
    const result = betsPostBetsInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof betsPostBetsInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = BetsPostBetsInternalServerErrorResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
