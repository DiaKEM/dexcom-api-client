import axios, { AxiosRequestConfig } from 'axios';
import schedule from 'node-schedule';
import { CGMDataType, transform, validate } from './utils';

const APPLICATION_ID = 'd89443d2-327c-4a6f-89e5-496bbb0317db';

type DexcomApiClientType = {
  username: string;
  password: string;
  server: 'US' | 'EU';
  clientOpts?: AxiosRequestConfig;
};

export const DexcomApiClient = ({
  username,
  password,
  server,
  clientOpts,
}: DexcomApiClientType) => {
  const targetServer =
    server === 'EU' ? 'shareous1.dexcom.com' : 'share2.dexcom.com';
  let sessionId: string | null = null;

  const client = axios.create({
    baseURL: `https://${targetServer}/ShareWebServices/Services`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...clientOpts,
  });

  const login = async () => {
    const payload = {
      accountName: username,
      password,
      applicationId: APPLICATION_ID,
    };

    try {
      const responses = await Promise.all([
        client.post('/General/AuthenticatePublisherAccount', payload),
        client.post('/General/LoginPublisherAccountByName', payload),
      ]);

      if (responses.some(e => !validate(e))) {
        throw new Error('Login failed.');
      }

      sessionId = responses[1].data;
    } catch (e) {
      throw new Error('Unable to login in');
    }
  };

  const loginAndTry = async <T>(func: () => Promise<T> | T) => {
    let response = null;

    if (!sessionId) await login();

    try {
      response = await func.apply(null);
    } catch (e) {
      await login();

      response = await func.apply(null);
    }

    return response;
  };

  const read = async (minutesAgo = 1440, count = 288): Promise<CGMDataType[]> =>
    loginAndTry<CGMDataType[]>(async () => {
      const params = {
        sessionId,
        minutes: minutesAgo,
        maxCount: count,
      };

      const response = await client.post(
        '/Publisher/ReadPublisherLatestGlucoseValues',
        null,
        { params }
      );

      return response.data.map(transform);
    });

  const readLast = async () => read(9999, 1);

  type ObserverInputType = {
    maxAttempts?: number;
    delay?: number;
    listener: (data: CGMDataType) => void;
  };
  const observe = async ({
    maxAttempts = 50,
    delay = 1000,
    listener,
  }: ObserverInputType) => {
    const [data] = await readLast();
    const rawMinutes = data.date.getMinutes();
    const a = String(rawMinutes).padStart(2, '0')[1];
    const b = String(rawMinutes + 5).padStart(2, '0')[1];
    const runPoints = ['0', '1', '2', '3', '4', '5'].reduce<string[]>(
      (acc, e) => [...acc, e + a, e + b],
      []
    );
    const proc = () => {
      let attempt = 0;
      const interval = setInterval(async () => {
        if (attempt >= maxAttempts) {
          clearInterval(interval);
        }

        const lastCgmData = await read(1, 1);

        if (lastCgmData.length) {
          listener.apply(null, [lastCgmData[0]]);
          clearInterval(interval);
        }
        attempt += 1;
      }, delay);
    };

    return schedule.scheduleJob(`${runPoints.join(',')} * * * *`, proc);
  };
  return {
    login,
    read,
    readLast,
    observe,
  };
};
