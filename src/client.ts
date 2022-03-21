import axios, { AxiosRequestConfig } from 'axios';
import { transform, validate } from './utils';

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

      console.log('Logged in successfully', sessionId);
    } catch (e) {
      throw new Error('Unable to login in');
    }
  };

  const loginAndTry = async <T>(func: () => Promise<T> | T | boolean) => {
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

  const read = async (minutesAgo = 1440, count = 288) =>
    loginAndTry<string>(async () => {
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

  return {
    login,
    read,
  };
};
