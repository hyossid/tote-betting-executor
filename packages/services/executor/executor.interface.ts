export interface CreateExecutorDto {
  eventType: string;
  timestamp: string;
  payLoad: string;
}

export interface ReleaseExecutorDto {
  raceNumber: string;
}

export interface RaceResultResponseDto {
  raceNumber: string;
  myBetHorse: string;
  myBetAmount: string;
  winHorse: string;
  dividends: string;
  resultAmount: string;
  result: string;
}

export abstract class ExecutorService {
  abstract processData({
    eventType,
    timestamp,
    payLoad,
  }: CreateExecutorDto): Promise<void>;

  abstract getRaceResult({
    raceNumber,
  }: ReleaseExecutorDto): Promise<RaceResultResponseDto>;
}
