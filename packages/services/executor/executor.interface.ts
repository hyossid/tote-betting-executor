export interface CreateExecutorDto {
  eventType: string;
  timestamp: string;
  payLoad: string;
}

export abstract class ExecutorService {
  abstract processData({
    eventType,
    timestamp,
    payLoad,
  }: CreateExecutorDto): Promise<void>;
}
