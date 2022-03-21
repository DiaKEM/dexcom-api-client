import { AxiosResponse } from 'axios';

type DexcomTrendType =
  | 'DoubleDown'
  | 'SingleDown'
  | 'FortyFiveDown'
  | 'Flat'
  | 'FortyFiveUp'
  | 'SingleUp'
  | 'DoubleUp';
type DexcomDataType = {
  WT: string;
  ST: string;
  DT: string;
  Value: number;
  Trend: DexcomTrendType;
};

type CGMDataType = {
  date: Date;
  value: number;
  trend: DexcomTrendType;
};
export const transform = (input: DexcomDataType): CGMDataType => {
  const parsedDate = input.WT.match(/Date\(([0-9]*)\)/);

  if (!parsedDate || !Array.isArray(parsedDate) || !parsedDate[1]) {
    throw new Error('Unable to parse dexcom object');
  }

  return {
    date: new Date(parseInt(parsedDate[1], 10)),
    value: input.Value,
    trend: input.Trend,
  };
};

export const validate = (payload: AxiosResponse) =>
  payload.data !== '00000000-0000-0000-0000-000000000000';
