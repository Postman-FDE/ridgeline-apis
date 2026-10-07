import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IPlayerLimitsPostLimitsNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const playerLimitsPostLimitsNotFoundResponseResponse = z.lazy(() => {
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

export class PlayerLimitsPostLimitsNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): PlayerLimitsPostLimitsNotFoundResponse {
    const error = new PlayerLimitsPostLimitsNotFoundResponse(message, response);
    const result = playerLimitsPostLimitsNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof playerLimitsPostLimitsNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = PlayerLimitsPostLimitsNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
