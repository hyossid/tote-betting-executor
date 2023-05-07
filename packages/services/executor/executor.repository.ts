import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import { LatestOddsSchema, RaceDataSchema } from './executor.repository.sql';

export class ExecutorRepository {
  private readonly logger = new Logger(ExecutorRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

  async insertHorseRacingData(params: {
    eventType: string;
    raceNumber: number;
    timestamp: string;
    payLoad: string;
  }) {
    const timeDate = new Date(Number(params.timestamp) / 1000).toISOString();
    await this.persistentService.pgPool.transaction(
      async (conn: { one: (arg0: any) => any }) => {
        const insertedData = await conn.one(sql<RaceDataSchema>`
          insert into horse_racing_data.race_data(event_type,
                                      race_number,
                                      payload,
                                      timestamp)
          values (${params.eventType},
                  ${params.raceNumber},
                  ${params.payLoad},
                  ${timeDate}) on conflict(event_type,race_number,timestamp)
                  do update set event_type = ${params.eventType},
                  race_number = ${params.raceNumber}, 
                  payload = ${params.payLoad},
                  timestamp = ${timeDate}
          returning *`);
        this.logger.debug(`[INFO] inserted data: ${params.eventType}`);
      },
    );
  }

  async updateLatestOdds(params: {
    raceNumber: number;
    timestamp: string;
    candidateHorse: string;
    candidateOdds: string;
  }) {
    const timeDate = new Date(Number(params.timestamp) / 1000).toISOString();
    await this.persistentService.pgPool.transaction(
      async (conn: { one: (arg0: any) => any }) => {
        const insertedData = await conn.one(sql<LatestOddsSchema>`
          insert into horse_racing_data.latest_odds(race_number,
                                      odds,
                                      candidate,
                                      updated_at)
          values (${params.raceNumber},
                  ${params.candidateOdds},
                  ${params.candidateHorse},
                  ${timeDate}) on conflict(race_number)
          do update set odds = ${params.candidateOdds},
                  candidate = ${params.candidateHorse}, 
                  updated_at = ${timeDate}
          returning *`);
        this.logger.debug(`[INFO] Updated odds: ${params.raceNumber}`);
      },
    );
  }

  async getLatestHorseRacingData(params: { raceNumber: string }) {
    return await this.persistentService.pgPool.any(sql<LatestOddsSchema>`
        select *
        from horse_racing_data.latest_odds
        where race_number = ${params.raceNumber};`);
  }
}
