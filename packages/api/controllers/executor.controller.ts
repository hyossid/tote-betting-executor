import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ExecutorService } from '@root/services/executor/executor.interface';
import { IsString } from 'class-validator';

class CreateIncomingMessageRequest {
  @ApiProperty()
  @IsString()
  declare eventType: string;

  @ApiProperty()
  @IsString()
  declare timestamp: string;

  @ApiProperty()
  declare payLoad: any;
}

class CreateRaceResultRequest {
  @ApiProperty()
  @IsString()
  declare raceNumber: string;
}

class CreateRaceResultResponse {
  @ApiProperty()
  @IsString()
  declare raceNumber: string;

  @ApiProperty()
  @IsString()
  declare myBetHorse: string;

  @ApiProperty()
  @IsString()
  declare myBetAmount: string;

  @ApiProperty()
  @IsString()
  declare winHorse: string;

  @ApiProperty()
  @IsString()
  declare dividends: string;

  @ApiProperty()
  @IsString()
  declare resultAmount: string;

  @ApiProperty()
  @IsString()
  declare result: string;
}

@Controller()
export class ExecutorController {
  private readonly logger = new Logger(ExecutorController.name);
  constructor(
    @Inject(ExecutorService)
    private readonly executorService: ExecutorService,
  ) {}

  /**
   * Endpoint for incoming messages
   *
   * @remarks
   * Input endpoint for all incoming data
   *
   */
  @Post('/v1/message')
  async createIncomingMessage(
    @Body()
    { eventType, timestamp, payLoad }: CreateIncomingMessageRequest,
  ): Promise<void> {
    try {
      await this.executorService.processData({
        eventType,
        timestamp,
        payLoad,
      });

      this.logger.debug(
        `[INFO] API Received Incoming Message of: ${eventType}`,
      );

      return;
    } catch (e) {
      throw new Error(`[ERROR] Unexpected Error ${e}`);
    }
  }

  /**
   * Endpoint for retrieving race result
   *
   * @remarks
   * Get the result of queried race_number
   *
   */
  @Get('/v1/race_result')
  async getRaceResult(
    @Query('race_number') { raceNumber }: CreateRaceResultRequest,
  ): Promise<CreateRaceResultResponse> {
    try {
      this.logger.debug(
        `[INFO] API Received Race Result retrieve request; Race number : ${raceNumber}`,
      );

      return await this.executorService.getRaceResult({ raceNumber });
    } catch (e) {
      throw new Error(`[ERROR] Unexpected Error ${e}`);
    }
  }
}
