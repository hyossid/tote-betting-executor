export interface RaceDataSchema {
  timestamp: number;
  eventType: string;
  payLoad: string;
  raceNumber: number;
}

export interface LatestOddsSchema {
  timestamp: number;
  odds: string;
  candidate: string;
  raceNumber: number;
}
