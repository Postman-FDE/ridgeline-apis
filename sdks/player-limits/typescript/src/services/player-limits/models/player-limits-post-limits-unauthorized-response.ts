import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPlayerLimitsPostLimitsUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const playerLimitsPostLimitsUnauthorizedResponseResponse = z.lazy(() => {
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

export class PlayerLimitsPostLimitsUnauthorizedResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PlayerLimitsPostLimitsUnauthorizedResponse {
    const error = new PlayerLimitsPostLimitsUnauthorizedResponse(message, response);
    const result = playerLimitsPostLimitsUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof playerLimitsPostLimitsUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PlayerLimitsPostLimitsUnauthorizedResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
