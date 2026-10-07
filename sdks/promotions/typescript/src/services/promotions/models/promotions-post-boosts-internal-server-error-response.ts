import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsPostBoostsInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const promotionsPostBoostsInternalServerErrorResponseResponse = z.lazy(() => {
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

export class PromotionsPostBoostsInternalServerErrorResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(
    message: string,
    response?: unknown,
  ): PromotionsPostBoostsInternalServerErrorResponse {
    const error = new PromotionsPostBoostsInternalServerErrorResponse(message, response);
    const result = promotionsPostBoostsInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsPostBoostsInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsPostBoostsInternalServerErrorResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
