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

## Observer

This is a very performant way of retrieving data from the sharing server. 
The procedure will therefore calculate the specific recurring time points in which data is expected. In general there will be 5 minutes in between.
After that calculation the procedure will be run only if data is expected. 
If this timepoint is reached the most recent value will be retrieved from the servers. 
The value should be present in a defined range. Otherwise the retrieval will be postponed to the next run.

```
await observe({
    // Maximum attempts to get the next value
    maxAttempts: 50,
    // Delay between attempts in ms
    delay: 2000,
    // Listener to be invoked
    listener: cgmData => {
      console.log('DATA RECEIVED', cgmData, new Date());
    },
});
```