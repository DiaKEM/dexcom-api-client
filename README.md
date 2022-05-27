# DiaKEM Dexcom Api Client

Retrieve data from Dexcom's sharing server.

## Description 

Dexcom Api Client will allow you to communicate with Dexcom's sharing service and pull recent and live glucose data. You have to provide valid credentials to connect to Dexcom's service.

This library is primarily used by DiaKEM's backend to communicate with Dexcom's sharing server and retrieve cgm data. But It can also be used for different purposes and applications.


## Installation

Just run `npm install @diakem/dexcom-api-client` to install the client.

## Usage

The client requires valid credentials to connect to Dexcom and offers to modes.

### Basic 

The basic mode works straight-forward and gives you all the control how to interact with the service:

```typescript
import { DexcomApiClient } from '@diakem/dexcom-api-client';

// Initialize the client by providing credentials and server location
const { read } = DexcomApiClient({
    username: 'my_username',
    password: 'my_password',
    server: 'EU',
});

// Retrieve data from the sharing service
const cgmData = await read();
```

This will return an array of cgm data with the following data structure:

```typescript
type CGMDataType = {
  date: Date;
  value: number;
  trend: DexcomTrendType;
};
```

The `DexcomTrendType` is also very simple:

```typescript
type DexcomTrendType =
  | 'DoubleDown'
  | 'SingleDown'
  | 'FortyFiveDown'
  | 'Flat'
  | 'FortyFiveUp'
  | 'SingleUp'
  | 'DoubleUp';
```

### Auto

This is a very performant way of retrieving data from the sharing server. 
The procedure will therefore calculate the specific recurring time points in which data is expected. In general there will be 5 minutes in between.
After that calculation the procedure will be run only if data is expected. 
If this timepoint is reached the most recent value will be retrieved from the servers. 
The value should be present in a defined range. Otherwise the retrieval will be postponed to the next run.

```typescript
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

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. 
Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. 
You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

* Fork the Project
* Create your Feature Branch (git checkout -b feature/AmazingFeature)
* Commit your Changes (git commit -m 'Add some AmazingFeature')
* Push to the Branch (git push origin feature/AmazingFeature)
* Open a Pull Request

### Standards

This project is using commit hooks to ensure code quality and prevent code smell. This will be done by ESLint and Prettier.
If there are noticeable problems with your code the commit will be rejected. Furthermore convential commits are used to
standardize commit messages to generate changelogs automatically.

## License

Distributed under the MIT License.

## Contact

Selcuk Kekec

E-mail: [khskekec@gmail.com](khskekec@gmail.com)
