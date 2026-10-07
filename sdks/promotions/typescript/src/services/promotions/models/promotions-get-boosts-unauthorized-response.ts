import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsGetBoostsUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const promotionsGetBoostsUnauthorizedResponseResponse = z.lazy(() => {
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

export class PromotionsGetBoostsUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsGetBoostsUnauthorizedResponse {
    const error = new PromotionsGetBoostsUnauthorizedResponse(message, response);
    const result = promotionsGetBoostsUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsGetBoostsUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsGetBoostsUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
