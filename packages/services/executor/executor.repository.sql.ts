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

export interface ExecutedBetSchema {
  timestamp: number;
  horse: string;
  raceNumber: number;
  amount: number;
}

export interface RaceResultSchema {
  dividens: number;
  horse: string;
  raceNumber: number;
}
