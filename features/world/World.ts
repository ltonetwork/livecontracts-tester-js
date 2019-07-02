import { World } from 'cucumber';
import { EventChainContext } from '../../src/EventChainContext';
import { ProcessContext } from '../../src/ProcessContext';
import { HTTPContext } from '../../src/HTTPContext';
import { DBContext } from '../../src/DBContext';

declare module "cucumber" {
  interface World {
    eventChainContext: EventChainContext;
    processContext: ProcessContext;
    httpContext: HTTPContext;
    dbContext: DBContext;
    error: Error;
  }
}

