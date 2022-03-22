import { AxiosResponse } from 'axios';
declare type DexcomTrendType =
  | 'DoubleDown'
  | 'SingleDown'
  | 'FortyFiveDown'
  | 'Flat'
  | 'FortyFiveUp'
  | 'SingleUp'
  | 'DoubleUp';
declare type DexcomDataType = {
  WT: string;
  ST: string;
  DT: string;
  Value: number;
  Trend: DexcomTrendType;
};
export declare type CGMDataType = {
  date: Date;
  value: number;
  trend: DexcomTrendType;
};
export declare const transform: (input: DexcomDataType) => CGMDataType;
export declare const validate: (payload: AxiosResponse) => boolean;
export {};
