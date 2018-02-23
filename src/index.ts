import * as appInsights from 'applicationinsights';
import * as express from 'express';
import * as uuid from 'uuid';
import { Logger } from './logger';

export const loggers = (app: express.Application, instrumentationKey: string, disableAutoCollect: boolean = false) => {
  const ai = appInsights.setup(instrumentationKey);

  if (disableAutoCollect) {
    ai
      .setAutoCollectPerformance(false)
      .setAutoCollectConsole(false)
      .setAutoCollectRequests(false)
      .setAutoCollectExceptions(false);
  }

  appInsights.start();
  const logger = new Logger(appInsights.defaultClient);

  app.locals.log = logger;
  app.locals.appInsights = ai;

  return {
    logError: (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.traceError(err, '', {
        url: req.url,
        requestId: res.locals.requestId,
      });
      next(err);
    },
    logRequest: (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const requestId = uuid.v4();
      res.locals.log = logger;
      res.locals.requestId = requestId;

      logger.trackRequest(req, res, { requestId });
      next();
    },
  };
};
