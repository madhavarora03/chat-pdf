export interface ResponsePayload<T = unknown> {
  message: string;
  data: T | null;
  error: unknown;
  success: boolean;
}
