# DiaKEM Dexcom Api Client

Retrieve data from Dexcom's sharing server

## Description 

This library is primarily used by DiaKEM's backend to communicate with 
## Technical overview
DIAKEM was built as microservice.
Its architectural structure enables it to function as central data-source and store for any third-party application.
These third party applications can communicate over the main api to store or retrieve data. 

DiaKEM offers an `graphql` api to store and query diabetes related data. 
Under the hood it uses a very simple approach and data structure.

The main data units are events. Events will be used to capture all kind of actions and happenings. 
To be able to react to this wide variety of possibilities all events own a type property. 
This property works as identifier and also specifies a special data structure to cover all parameters of an action. 

### Foundation 

DiaKEM is based on nodejs and provides a graphql api

## Installation

### Requirements

DiaKEM is very lightweight and does not require a high amount of computer resources. 
It is only common to reserve enough diskspace for MongoDB.

* NodeJS >= 16.x
* MongoDB >= 4.x

### Setup

Install all dependencies by running `npm install`

## Build with

* graphql
* mongoose
* koa
* 
## Development

Simply run `npm start`

### Debugging

Create an debugging configuration in PHPStorm:

Type: Attach to Node
Host: localhost
Port: 9229

Run application wit inspector:

`npm run debug`

Start debugging session in PhpStorm bei clicking on the debug icon next to the configuration

### Troubleshooting

DiaKEM will log debug information in `development` mode to support you during investigating problems Beside of that there is a useful
command to find general issues about the graph schema definition:

```
npm run diagnosis
```
Please ensure that the server is available on port `4000`.

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

DiaKEM is using commit hooks to ensure code quality and prevent code smell. This will be done by ESLint and Prettier.
If there are noticeable problems with your code the commit will be rejected. Furthermore convential commits are used to
standardize commit messages to generate changelogs automatically.

## License

Distributed under the MIT License.

## Contact

Selcuk Kekec

E-mail: [khskekec@gmail.com](khskekec@gmail.com)
