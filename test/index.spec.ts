import { logger, logRequest } from '../src';
import * as express from 'express';
import * as ai from 'applicationinsights';

describe('middleware', () => {
  const app = {
    locals: {},
  } as express.Application;
  let middleware: Function;

  beforeEach(done => {
    ai.setup = jest.fn();
    ai.start = jest.fn();

    middleware = logger(app, { key: 'dev' });

    done();
  });

  describe('logger', () => {
    const _logRequest = logRequest;
    beforeEach(done => {
      logRequest = jest.fn();
      done();
    });

    afterEach(done => {
      logRequest.mockRestore();
      logRequest = _logRequest;
      done();
    });

    it('setups application insights', () => {
      expect(ai.setup).toBeCalledWith('dev');
      expect(ai.start).toHaveBeenCalled();
    });

    it('should expose a logger instance', () => {
      expect(app.locals.logger).toBeDefined();
    });

    it('should return an express middleware', () => {
      expect(middleware).toBeInstanceOf(Function);
      expect(middleware.length).toEqual(3);
    });

    it('should attach a logger instance to each request', () => {
      const res = { locals: {} };
      middleware({}, res, jest.fn());

      expect(res.locals.logger).toBeDefined();
    });

    it('should attach a requestId each request', () => {
      const res = { locals: {} };
      middleware({}, res, jest.fn());

      expect(res.locals.requestId).toBeDefined();
    });
  });

  describe('logRequest', () => {
    it('should return an express middleware', () => {
      expect(middleware).toBeInstanceOf(Function);
      expect(middleware.length).toEqual(3);
    });

    it('should call trackRequest() once', () => {
      const trackRequest = jest.fn();
      const req = {} as express.Request;
      const res = {
        locals: {
          logger: {
            trackRequest,
          },
        },
      } as express.Response;
      logRequest(req, res, jest.fn());
      expect(trackRequest).toHaveBeenCalled();
    });
  });
});
