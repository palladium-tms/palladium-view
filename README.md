# Palladium

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.
The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component.
You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project
(By default use `--configuration production` flag).
The build artifacts will be stored in the `dist/` directory.

### Build aot disable

Run `build-aot-disable`. Just-in-Time (JIT) Compiles your application
in the browser at runtime.

### Build with docker

Run `./docker-build/build.sh` or `npm run build-aot-disable` to build
the project via docker container.

## Running unit tests

Install dependensies and run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the
[Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
