import { smoke } from '@root/testing/smoke';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

const PORT = '3003';
const INPUT_ENDPOINT = `http://localhost:${PORT}/v1/message`;

const it = smoke(__filename);
describe('API Hitting test by event type', () => {
  // Make sure api server is running at the designated port
  it('Process type [RACE_DATA]', async () => {
    await axios.post(
      INPUT_ENDPOINT,
      {
        eventType: 'RACE_DATA',
        timestamp: '1675486800000000.0',
        payLoad:
          '{"race_number": 3, "horses": ["RUN RUN COOL", "SHOW RESPECT", "SUPER FORTUNE", "WE ARE HERO", "QUADRUPLE DOUBLE", "HAPPY MISSION", "PARTY WARRIOR", "LUCKY FUN", "TALENTS SUPREMO", "DECRYPT", "DIAMOND FLARE", "LEAN MASTER", "EIGHT TRIGRAMS", "SAVVY DELIGHT"]}',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('Process type [START_RACE]', async () => {
    await axios.post(
      INPUT_ENDPOINT,
      {
        eventType: 'START_RACE',
        timestamp: '1675486800000000.0',
        payLoad: '{"race_number": 4}',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  });
});

describe('E2E Testing', () => {
  const TEST_FILE_PATH = './dev_test.csv';
  // Make sure api server is running at the designated port
  it('E2E Testing', async () => {
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
      await axios.post(
        INPUT_ENDPOINT,
        {
          eventType: testData[1],
          timestamp: testData[0],
          payLoad: testData[2],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }
  });
});
