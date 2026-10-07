import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsPostBoostsClaimUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const promotionsPostBoostsClaimUnauthorizedResponseResponse = z.lazy(() => {
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

export class PromotionsPostBoostsClaimUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsPostBoostsClaimUnauthorizedResponse {
    const error = new PromotionsPostBoostsClaimUnauthorizedResponse(message, response);
    const result = promotionsPostBoostsClaimUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsPostBoostsClaimUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsPostBoostsClaimUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
