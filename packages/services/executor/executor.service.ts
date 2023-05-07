import { Inject, Logger } from '@nestjs/common';
import {
  CreateExecutorDto,
  ExecutorService,
} from '@root/services/executor/executor.interface';
import { ExecutorRepository } from './executor.repository';

export class DefaultExecutorService implements ExecutorService {
  private logger = new Logger(DefaultExecutorService.name);
  constructor(
    @Inject(ExecutorRepository)
    private readonly executorRepository: ExecutorRepository,
  ) {}

  async processData({
    eventType,
    timestamp,
    payLoad,
  }: CreateExecutorDto): Promise<void> {
    const parsedPayload = JSON.parse(payLoad);
    const raceNumber = parsedPayload.race_number;
    let result: { horseName: string; amount: number };

    switch (eventType) {
      case 'RACE_DATA':
        this.logger.log(`[INFO] Received new RACE_DATA type ${raceNumber}`);
        // Info : Can add additional logic after receiving initial race info
        break;
      case 'UPDATE_ODDS':
        this.logger.log(
          `[INFO] Received new UPDATE_ODDS, race number :  ${raceNumber}, Updating odds`,
        );
        await this.updateOdds({ raceNumber, timestamp, payLoad });
        break;
      case 'PLACE_BETS':
        this.logger.log(
          `[INFO] Received new PLACE_BETS type ${raceNumber}, starting execution`,
        );
        result = await this.getResultFromModel(raceNumber);
        this.executeBetting({
          raceNumber,
          horseName: result.horseName,
          amount: result.amount,
        });

        break;
      case 'START_RACE':
        this.logger.log(`[INFO] Received new START_RACE type ${raceNumber}`);
        // Info : Can add additional logic after race starts
        break;
      case 'DIVIDENS':
        this.logger.log(`[INFO] Received DIVIDENS type ${raceNumber}`);
        // Info : Can add additional logic after receiving final dividens
        break;
      default:
        this.logger.log(
          `[WARNING] Event Type ${eventType} is unknown, Skipping unknown data`,
        );
        return;
    }

    // Always save received data
    await this.insertData({ eventType, raceNumber, timestamp, payLoad });

    return;
  }

  async insertData({
    eventType,
    raceNumber,
    timestamp,
    payLoad,
  }: any): Promise<void> {
    await this.executorRepository.insertHorseRacingData({
      eventType,
      raceNumber,
      timestamp,
      payLoad,
    });
    return;
  }

  async updateOdds({ raceNumber, timestamp, payLoad }: any): Promise<void> {
    const parsedPayload = JSON.parse(payLoad);
    const odds = parsedPayload.odds;
    const sortArray = [];

    for (const horse in odds) {
      sortArray.push([horse, odds[horse]]);
    }
    sortArray.sort(function (a, b) {
      return b[1] - a[1];
    });

    const candidateHorse = sortArray[0][0];
    const candidateOdds = sortArray[0][1];

    await this.executorRepository.updateLatestOdds({
      raceNumber,
      timestamp,
      candidateHorse,
      candidateOdds,
    });
    return;
  }

  async executeBetting({ raceNumber, horseName, amount }: any) {
    this.logger.log(
      `[INFO] Executing race ${raceNumber}, with ${horseName}; amount : ${amount}`,
    );
    // Info : Execution details can be implemented here
    return;
  }

  async getResultFromModel(raceNumber: string) {
    this.logger.log(`[INFO] Model RUNNING ${raceNumber}`);

    // Info : Model can be implemented here, currently just getting highest odds that db has

    const AMOUNT = 1; // amount fixed to 1

    const latestOdds = (
      await this.executorRepository.getLatestHorseRacingData({
        raceNumber,
      })
    )[0];

    return { horseName: latestOdds.candidate, amount: AMOUNT };
  }
}

export const ExecutorProvider = {
  provide: ExecutorService,
  useClass: DefaultExecutorService,
};

export default ExecutorProvider;
