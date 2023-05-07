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
describe('executor flow', () => {
  let executorService: ExecutorService;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [ExecutorModule],
    });

    executorService = module.get(ExecutorService);
  });

  it('Process Race Info', async () => {
    const exampleRaceData = [
      '1675486800000000.0',
      'RACE_DATA',
      '{"race_number": 3, "horses": ["RUN RUN COOL", "SHOW RESPECT", "SUPER FORTUNE", "WE ARE HERO", "QUADRUPLE DOUBLE", "HAPPY MISSION", "PARTY WARRIOR", "LUCKY FUN", "TALENTS SUPREMO", "DECRYPT", "DIAMOND FLARE", "LEAN MASTER", "EIGHT TRIGRAMS", "SAVVY DELIGHT"]}',
    ];

    await (executorService as DefaultExecutorService).processData({
      eventType: exampleRaceData[1],
      timestamp: exampleRaceData[0],
      payLoad: exampleRaceData[2],
    });
  });

  it('Updating Odds', async () => {
    const content = fs.readFileSync('./dev_test.csv', {
      encoding: 'utf-8',
    });

    const lines: string[] = parse(content, {
      columns: false,
      skip_empty_lines: true,
      from_line: 2,
    });

    for (let ind = 10; ind < 11; ind++) {
      const exampleRaceData = lines[ind];
      await (executorService as DefaultExecutorService).processData({
        eventType: exampleRaceData[1],
        timestamp: exampleRaceData[0],
        payLoad: exampleRaceData[2],
      });
    }
  });

  it('PLACE_BET test', async () => {
    const exampleRaceData = [
      '1675573247000000.0',
      'PLACE_BETS',
      '{"race_number": 1}',
    ];
    await (executorService as DefaultExecutorService).processData({
      eventType: exampleRaceData[1],
      timestamp: exampleRaceData[0],
      payLoad: exampleRaceData[2],
    });
  });

  it('DIVIDENDS test', async () => {
    const exampleRaceData = [
      '1675573683000000.0',
      'DIVIDENDS',
      '{"race_number": 1, "dividends": {"ERNEST FEELING": 143.5}}',
    ];
    await (executorService as DefaultExecutorService).processData({
      eventType: exampleRaceData[1],
      timestamp: exampleRaceData[0],
      payLoad: exampleRaceData[2],
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
      const exampleRaceData = lines[ind];
      await (executorService as DefaultExecutorService).processData({
        eventType: exampleRaceData[1],
        timestamp: exampleRaceData[0],
        payLoad: exampleRaceData[2],
      });
    }
  });
});
