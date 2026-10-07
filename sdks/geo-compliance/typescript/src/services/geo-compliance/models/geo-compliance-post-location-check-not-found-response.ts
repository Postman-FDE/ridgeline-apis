import { z } from 'zod';
import { ThrowableError } from '../../../http/errors/throwable-error';

export type IGeoCompliancePostLocationCheckNotFoundResponseSchema = {
  error: string;
  message: string;
};

export const geoCompliancePostLocationCheckNotFoundResponseResponse = z.lazy(() => {
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

export class GeoCompliancePostLocationCheckNotFoundResponse extends ThrowableError {
  public error!: string;

  constructor(
    public message: string,
    protected response?: unknown,
  ) {
    super(message);
  }

  static from(message: string, response?: unknown): GeoCompliancePostLocationCheckNotFoundResponse {
    const error = new GeoCompliancePostLocationCheckNotFoundResponse(message, response);
    const result = geoCompliancePostLocationCheckNotFoundResponseResponse.safeParse(response);
    const parsedResponse = (result.success ? result.data : response || {}) as z.infer<
      typeof geoCompliancePostLocationCheckNotFoundResponseResponse
    >;

    error.error = parsedResponse.error;
    error.message = parsedResponse.message || '';

    return error;
  }

  public throw() {
    const error = GeoCompliancePostLocationCheckNotFoundResponse.from(this.message, this.response);
    error.metadata = this.metadata;
    throw error;
  }
}
