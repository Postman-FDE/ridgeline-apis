import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsPostBoostsBadRequestResponseSchema = {
  error: string;
  message: string;
};

export const promotionsPostBoostsBadRequestResponseResponse = z.lazy(() => {
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

export class PromotionsPostBoostsBadRequestResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsPostBoostsBadRequestResponse {
    const error = new PromotionsPostBoostsBadRequestResponse(message, response);
    const result = promotionsPostBoostsBadRequestResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsPostBoostsBadRequestResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsPostBoostsBadRequestResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
