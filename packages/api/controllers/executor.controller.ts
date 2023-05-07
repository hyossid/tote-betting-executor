import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
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

@Controller()
export class ExecutorController {
  private readonly logger = new Logger(ExecutorController.name);
  constructor(
    @Inject(ExecutorService)
    private readonly executorService: ExecutorService,
  ) {}

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

  @Get('/v1/race_result')
  async getRaceResult(): Promise<void> {
    try {
      // TODO: race result
      this.logger.debug(`[INFO] API Received Race Result retreive request `);

      return;
    } catch (e) {
      throw new Error(`[ERROR] Unexpected Error ${e}`);
    }
  }
}
