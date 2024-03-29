import { Inject, Logger } from '@nestjs/common';
import {
  CreateExecutorDto,
  ExecutorService,
  ReleaseExecutorDto,
} from '@root/services/executor/executor.interface';
import { CustomModuleService } from '../custom-module/custom-module.interface';
import { ExecutorRepository } from './executor.repository';

export class DefaultExecutorService implements ExecutorService {
  private logger = new Logger(DefaultExecutorService.name);
  constructor(
    @Inject(ExecutorRepository)
    @Inject(CustomModuleService)
    private readonly executorRepository: ExecutorRepository,
    private readonly customModuleService: CustomModuleService,
  ) {}

  /**
   * Processes input data
   *
   * @remarks
   * This method is the main processing unit of executing component
   *
   * @param eventType - Given event type of race data
   * @param timestamp - Given timestamp of race data
   * @param payLoad - Actual payload
   * @returns void
   *
   */
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
        // await this.handleRaceData({ raceNumber, timestamp, payLoad });
        break;
      case 'UPDATE_ODDS':
        this.logger.log(
          `[INFO] Received new UPDATE_ODDS, race number :  ${raceNumber}, Updating odds`,
        );
        await this.handleUpdateOdds({ raceNumber, timestamp, payLoad });
        break;
      case 'PLACE_BETS':
        this.logger.log(
          `[INFO] Received new PLACE_BETS type ${raceNumber}, starting execution`,
        );
        result = await this.getResultFromModel(raceNumber);
        await this.handleExecute({
          raceNumber,
          horseName: result.horseName,
          amount: result.amount,
        });

        break;
      case 'START_RACE':
        this.logger.log(`[INFO] Received new START_RACE type ${raceNumber}`);
        // Info : Can add additional logic after race starts
        // await this.handleStart({ raceNumber, timestamp, payLoad });

        break;
      case 'DIVIDENDS':
        this.logger.log(`[INFO] Received DIVIDENDS type ${raceNumber}`);
        // Info : Can add additional logic after receiving final dividens
        await this.handleDividends({ raceNumber, payLoad });
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

  /**
   * Inserts data to configured database
   *
   * @remarks
   * This method inserts processed data to database
   *
   * @param eventType - Given event type of race data
   * @param raceNumber - Race number of given race data
   * @param timestamp - Given timestamp of race data
   * @param payLoad - Actual payload
   * @returns void
   *
   */
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

  /**
   * Handles Event type: UPDATE_ODDS
   *
   * @remarks
   * This method inserts processed data to database
   *
   * @param raceNumber - Race number of given race data
   * @param timestamp - Given timestamp of race data
   * @param payLoad - Actual payload
   * @returns void
   *
   */
  async handleUpdateOdds({
    raceNumber,
    timestamp,
    payLoad,
  }: any): Promise<void> {
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

  /**
   * Handles Event type: START_RACE
   *
   * @remarks
   * This method handles event start race;
   *
   * @param raceNumber - Race number of given race data
   * @param horseName - Horse candidate to be executed
   * @param amount - Amount of bet
   * @returns void
   *
   */
  async handleExecute({ raceNumber, horseName, amount }: any) {
    this.logger.log(
      `[INFO] Executing race ${raceNumber}, with ${horseName}; amount : ${amount}`,
    );

    // Info : Execution details can be implemented here
    await this.executorRepository.insertExecutedBet({
      timestamp: Date.now(),
      horse: horseName,
      amount,
      raceNumber,
    });

    return;
  }

  /**
   * Handles Event type: DIVIDENS
   *
   * @remarks
   * This method handles event type dividens.
   *
   * @param raceNumber - Race number of given race data
   * @param payLoad - dividends
   * @returns void
   *
   */
  async handleDividends({ raceNumber, payLoad }: any) {
    this.logger.log(`[INFO] Saving Result of race ${raceNumber}`);

    const parsedPayload = JSON.parse(payLoad);
    const result = parsedPayload.dividends;
    const horse = Object.keys(result)[0];
    const dividends = result[horse];
    await this.executorRepository.insertRaceResult({
      horse,
      dividends,
      raceNumber,
    });

    return;
  }

  /**
   * Handles data from the plugged model
   *
   * @remarks
   * Users may implement model with this interface
   *
   * @param raceNumber - Race number of given race data
   * @returns
   * { horseName: latestOdds.candidate, amount: AMOUNT }
   *
   */
  async getResultFromModel(raceNumber: string) {
    this.logger.log(`[INFO] Model RUNNING ${raceNumber}`);

    const AMOUNT = 1; // amount fixed to 1
    const latestOdds = (
      await this.executorRepository.getLatestHorseRacingData({
        raceNumber,
      })
    )[0];

    // Info : Model can be implemented here, currently just getting highest odds that db has
    // This snippet is just to show how module can be implemented
    const data = await this.customModuleService.processData({
      data: latestOdds,
    });

    return { horseName: latestOdds.candidate, amount: AMOUNT };
  }

  /**
   * Get race results from the database
   *
   * @remarks
   * Get race results from the database
   *
   * @param raceNumber - Race number of given race data
   * @returns
   *
   */

  async getRaceResult({ raceNumber }: ReleaseExecutorDto) {
    const raceResult = (
      await this.executorRepository.getRaceResult({
        raceNumber,
      })
    )[0];
    return {
      raceNumber: raceResult.race_number,
      myBetHorse: raceResult.my_bet_horse,
      myBetAmount: String(raceResult.my_bet_amount),
      winHorse: raceResult.win_horse,
      dividends: String(raceResult.dividens),
      resultAmount: String(raceResult.result_amount),
      result: raceResult.result,
    };
  }
}

export const ExecutorProvider = {
  provide: ExecutorService,
  useClass: DefaultExecutorService,
};

export default ExecutorProvider;
