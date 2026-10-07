import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPromotionsGetBoostsInternalServerErrorResponseSchema = {
  error: string;
  message: string;
};

export const promotionsGetBoostsInternalServerErrorResponseResponse = z.lazy(() => {
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

export class PromotionsGetBoostsInternalServerErrorResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PromotionsGetBoostsInternalServerErrorResponse {
    const error = new PromotionsGetBoostsInternalServerErrorResponse(message, response);
    const result = promotionsGetBoostsInternalServerErrorResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof promotionsGetBoostsInternalServerErrorResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PromotionsGetBoostsInternalServerErrorResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
