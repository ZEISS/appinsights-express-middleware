# Express Middleware for Microsoft Application Insights

A simple middleware for exposing [Microsoft Application Insights](https://azure.microsoft.com/services/application-insights/) in your [Express](http://expressjs.com/) application.

## Getting started

`npm install appinsights-express-middleware@latest`

## Example Usage

For setting up logging in your application you need to import the `logger` function and pass your application as the first parameter and your Application Insights key in the option object as the second parameter.

```
import * as express from 'express';
import { logger } from 'appinsights-express-middleware';

const app = express();
app.use(logger(app, { key: 'YOUR_INSTRUMENTATION_KEY' }));

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
```

For tracking errors you need to import the middleware explictly and pass it to express after all other `app.use()` and route calls.

```
import * as express from 'express';
import * as bodyParser from 'body-parser'
import { logError } from 'appinsights-express-middleware';

const app = express();
app.use(logger(app, { key: 'YOUR_INSTRUMENTATION_KEY', traceErrors: true }));
app.use(bodyParser.json());
app.use(logError);

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
```

With this setup Express will log every request and track every error and send it to Application Insights. But how about logging inside your routes, or different parts of your application?

### Logging during a request
After you set up the logger it is available through the `res` object.

```
import * as express from 'express';
import { logger } from 'appinsights-express-middleware';

const app = express();
app.use(logger(app, { key: 'YOUR_INSTRUMENTATION_KEY' }));

app.get('/', (req, res) => {
  res.locals.logger.trackEvent('page', {
    val: 'extra information',
    requestId: res.locals.requestId
  });

  res.send('hello world');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
```
Keep in mind that the `requestId` is not required, it is provided as a convenience to correlate logs for request.

### Logging outside of the request loop

Logging can also be done outside the HTTP Request context. For that use the `app.locals.logger` object:

#### app.js
```
import * as express from 'express';
import { logger } from 'appinsights-express-middleware';

export const app = express();

app.use(logger(app, { key: 'YOUR_INSTRUMENTATION_KEY' }));

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
```

#### server.js
```
import { app } from './app';
import * as http from 'http';

const server = http.createServer(app);

const errorHandler = error => {
  app.locals.logger.traceError(error, 'Error during startup.');
}

const listeningHandler = () => {
  app.locals.logger.traceInfo('Server listening.', {
    port: server.address().port
  });
}

server.on('error', errorHandler);
server.on('listening', listeningHandler);
```

## Logging API

```
traceInfo(message: string, properties?: {[key: string]: string}): void;
traceError(error: Error, message: string, properties?: {[key: string]: string}): void;
traceWarning(message: string, properties?: {[key: string]: string}): void;
traceVerbose(message: string, properties?: {[key: string]: string}): void;
traceCritical(message: string, properties?: {[key: string]: string});

trackEvent(name: string, properties?: {[key: string]: string}): void;
trackMetric(name: string, value: number): void;
trackRequest(req: express.Request, res: express.Response): void
```
