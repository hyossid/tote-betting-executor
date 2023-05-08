import { TestingModule } from '@nestjs/testing';
import { createTestingModule } from '@root/testing/createTestingModule';
import { smoke } from '@root/testing/smoke';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { ExecutorService } from './executor.interface';
import { ExecutorModule } from './executor.module';
import { DefaultExecutorService } from './executor.service';

const TEST_FILE_PATH = './dev_test.csv';

const it = smoke(__filename);
describe('Executor Flow', () => {
  let executorService: ExecutorService;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [ExecutorModule],
    });

    executorService = module.get(ExecutorService);
  });

  it('Process type [RACE_DATA]', async () => {
    const testData = [
      '1675486800000000.0',
      'RACE_DATA',
      '{"race_number": 3, "horses": ["RUN RUN COOL", "SHOW RESPECT", "SUPER FORTUNE", "WE ARE HERO", "QUADRUPLE DOUBLE", "HAPPY MISSION", "PARTY WARRIOR", "LUCKY FUN", "TALENTS SUPREMO", "DECRYPT", "DIAMOND FLARE", "LEAN MASTER", "EIGHT TRIGRAMS", "SAVVY DELIGHT"]}',
    ];

    await (executorService as DefaultExecutorService).processData({
      eventType: testData[1],
      timestamp: testData[0],
      payLoad: testData[2],
    });
  });

  it('Process type [UPDATE_ODDS]', async () => {
    const content = fs.readFileSync('./dev_test.csv', {
      encoding: 'utf-8',
    });

    const lines: string[] = parse(content, {
      columns: false,
      skip_empty_lines: true,
      from_line: 2,
    });

    for (let ind = 10; ind < 11; ind++) {
      const testData = lines[ind];
      await (executorService as DefaultExecutorService).processData({
        eventType: testData[1],
        timestamp: testData[0],
        payLoad: testData[2],
      });
    }
  });

  it('Process type [START_RACE]', async () => {
    const testData = ['1675578956000000.0', 'START_RACE', '{"race_number": 4}'];
    await (executorService as DefaultExecutorService).processData({
      eventType: testData[1],
      timestamp: testData[0],
      payLoad: testData[2],
    });
  });

  it('Process type [PLACE_BET]', async () => {
    const testData = ['1675573247000000.0', 'PLACE_BETS', '{"race_number": 1}'];
    await (executorService as DefaultExecutorService).processData({
      eventType: testData[1],
      timestamp: testData[0],
      payLoad: testData[2],
    });
  });

  it('Process type [DIVIDENDS]', async () => {
    const testData = [
      '1675573683000000.0',
      'DIVIDENDS',
      '{"race_number": 1, "dividends": {"ERNEST FEELING": 143.5}}',
    ];
    await (executorService as DefaultExecutorService).processData({
      eventType: testData[1],
      timestamp: testData[0],
      payLoad: testData[2],
    });
  });

  it('GET Result', async () => {
    await (executorService as DefaultExecutorService).getRaceResult({
      raceNumber: '1',
    });
  });
});

describe('Execute Test with file', () => {
  let executorService: ExecutorService;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [ExecutorModule],
    });

    executorService = module.get(ExecutorService);
  });

  it('Batch testing', async () => {
    const content = fs.readFileSync(TEST_FILE_PATH, {
      encoding: 'utf-8',
    });

    const lines: string[] = parse(content, {
      columns: false,
      skip_empty_lines: true,
      from_line: 2,
    });

    for (let ind = 0; ind < lines.length; ind++) {
      const testData = lines[ind];
      await (executorService as DefaultExecutorService).processData({
        eventType: testData[1],
        timestamp: testData[0],
        payLoad: testData[2],
      });
    }
  });
});
