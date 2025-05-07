export interface ApiResponse<T> {
  message: string;
  correlationId: string;
  count: number;
  data: T;
}