import axios, { AxiosRequestConfig } from 'axios';
import schedule, { Job } from 'node-schedule';
import { CGMDataType, getLogger, transform, validate } from './utils';

const APPLICATION_ID = 'd89443d2-327c-4a6f-89e5-496bbb0317db';

type DexcomApiClientType = {
  username: string;
  password: string;
  server: 'US' | 'EU';
  clientOpts?: AxiosRequestConfig;
  debug: boolean;
};

export const DexcomApiClient = ({
  username,
  password,
  server,
  clientOpts,
  debug = false,
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
  const logger = getLogger(debug);

  const login = async () => {
    const payload = {
      accountName: username,
      password,
      applicationId: APPLICATION_ID,
    };

    try {
      logger(`Trying to login with credentials ${username}:********`);
      const accountIdResponse = await client.post(
        '/General/AuthenticatePublisherAccount',
        payload
      );

      if (!validate(accountIdResponse) || !accountIdResponse.data) {
        throw new Error('Unable to retrieve account id.');
      }

      const sessionResponse = await client.post(
        '/General/LoginPublisherAccountById',
        {
          accountId: accountIdResponse.data,
          password,
          applicationId: APPLICATION_ID,
        }
      );

      if (!validate(sessionResponse) || !sessionResponse.data) {
        logger('Login failed');
        throw new Error('Login failed.');
      }

      sessionId = sessionResponse.data;
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
      logger('Reading CGM data...');
      const response = await client.post(
        '/Publisher/ReadPublisherLatestGlucoseValues',
        null,
        { params }
      );
      logger('Data successfully retrieved');
      return response.data.map(transform);
    });

  const readLast = async () => read(9999, 1);

  type ObserverInputType = {
    maxAttempts?: number;
    delay?: number;
    listener: (data: CGMDataType) => void;
  };

  let job: Job | null = null;

  const observe = async ({
    maxAttempts = 50,
    delay = 1000,
    listener,
  }: ObserverInputType) => {
    if (job) {
      logger('Previous job exists - let us cancel it.');
      job.cancel();
    }

    logger('Reading last cgm dataset...');
    const [data] = await readLast();
    logger(`Last cgm dataset: ${JSON.stringify(data)}`);
    logger(`Extracting minute information from ${data.date}...`);
    const rawMinutes = data.date.getMinutes();
    const a = String(rawMinutes).padStart(2, '0')[1];
    const b = String(rawMinutes + 5).padStart(2, '0')[1];
    logger(
      `Extraction successfull - ${a} and ${b} are our minute informations.`
    );
    const runPoints = ['0', '1', '2', '3', '4', '5'].reduce<string[]>(
      (acc, e) => [...acc, e + a, e + b],
      []
    );
    logger(`Calculated time points: ${JSON.stringify(runPoints)}`);
    logger('Preparation done! Let us wait for new incoming data.');
    const proc = () => {
      let attempt = 0;
      const interval = setInterval(async () => {
        logger(`-------- Attempt ${attempt} of ${maxAttempts} --------`);
        if (attempt >= maxAttempts) {
          logger(
            'Maximum attempts reached - aborting current process and restarting it to recalculate specific runpoints.'
          );
          clearInterval(interval);
          observe({
            maxAttempts,
            delay,
            listener,
          });

          return;
        }

        logger('Trying to retrieve new cgm data...');
        const lastCgmData = await read(1, 1);

        if (lastCgmData.length) {
          logger('New cgm dataset is available.');
          listener.apply(null, [lastCgmData[0]]);
          clearInterval(interval);
          logger('Sleep for 5 minutes...');
        } else {
          logger(`No new data available - retry in ${delay}`);
        }

        attempt += 1;
      }, delay);
    };

    job = schedule.scheduleJob(`${runPoints.join(',')} * * * *`, proc);

    return job;
  };

  return {
    login,
    read,
    readLast,
    observe,
  };
};
