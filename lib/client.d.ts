import { AxiosRequestConfig } from 'axios';
import schedule from 'node-schedule';
import { CGMDataType } from './utils';
declare type DexcomApiClientType = {
    username: string;
    password: string;
    server: 'US' | 'EU';
    clientOpts?: AxiosRequestConfig;
};
export declare const DexcomApiClient: ({ username, password, server, clientOpts, }: DexcomApiClientType) => {
    login: () => Promise<void>;
    read: (minutesAgo?: number, count?: number) => Promise<CGMDataType[]>;
    readLast: () => Promise<CGMDataType[]>;
    observe: ({ maxAttempts, delay, listener, }: {
        maxAttempts?: number | undefined;
        delay?: number | undefined;
        listener: (data: CGMDataType) => void;
    }) => Promise<schedule.Job>;
};
export {};
