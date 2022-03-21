# DiaKEM Dexcom Api Client

Retrieve data from Dexcom's sharing server.

## Description 

This library is primarily used by DiaKEM's backend to communicate with dexcom's sharing server and retrieve cgm data. 

## Installation

`npm install @diakem/dexcom-api-client`

## Usage

```
import { DexcomApiClient } from '@diakem/dexcom-api-client';

const { read } = DexcomApiClient({
    username: 'my_username',
    password: 'my_password',
    server: 'EU',
});

const cgmData = await read();
```

This will return an array of cgm data with the following data structure:

```
type CGMDataType = {
  date: Date;
  value: number;
  trend: DexcomTrendType;
};
```