import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IGeoCompliancePostLocationCheckUnauthorizedResponseSchema = {
  error: string;
  message: string;
};

export const geoCompliancePostLocationCheckUnauthorizedResponseResponse = z.lazy(() => {
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

export class GeoCompliancePostLocationCheckUnauthorizedResponse extends ThrowableError {
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
  ): GeoCompliancePostLocationCheckUnauthorizedResponse {
    const error = new GeoCompliancePostLocationCheckUnauthorizedResponse(message, response);
    const result = geoCompliancePostLocationCheckUnauthorizedResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof geoCompliancePostLocationCheckUnauthorizedResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = GeoCompliancePostLocationCheckUnauthorizedResponse.from(
      this.message,
      this.response,
    );
    error.metadata = this.metadata;
    throw error;
  }
}
