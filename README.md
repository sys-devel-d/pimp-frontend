# PimpFrontend

## Setup
All commands require angular-cli. You can install it globally **OR** use the one that gets installed locally.

###### Global (might require `sudo`)
`ǹpm i -g angular-cli`

###### Local
First install all dependencies via
`npm i`.
Then angular-cli is available as `node_modules/angular-cli/bin/ng` which you then have to use instead of `ǹg`.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.
