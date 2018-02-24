import * as appInsights from 'applicationinsights';
import * as express from 'express';
import * as uuid from 'uuid';
import { Logger } from './logger';

export interface AppInsightsExpressOptions {
  key?: string;
  disableAutoCollect?: boolean;
}

export const logger = (app: express.Application, options?: AppInsightsExpressOptions = {}) => {
  const key = options.key || process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '';
  const ai = appInsights.setup(key);

  if (options.disableAutoCollect) {
    ai
      .setAutoCollectPerformance(false)
      .setAutoCollectConsole(false)
      .setAutoCollectRequests(false)
      .setAutoCollectExceptions(false);
  }

  appInsights.start();
  const logger = new Logger(appInsights.defaultClient);

  app.locals.logger = logger;
  app.locals.appInsights = ai;

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.logger = logger;
    res.locals.requestId = uuid.v4();
    logRequest(req, res, next);
  };
};

export const logRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.logger.trackRequest(req, res, { requestId: res.locals.requestId });
  next();
};

export const logError = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.locals.logger.traceError(err, '', {
    url: req.url,
    requestId: res.locals.requestId,
  });
  next(err);
};
