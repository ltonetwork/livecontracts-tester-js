import { World } from 'cucumber';
import { EventChainContext } from '../../src/EventChainContext';
import { ProcessContext } from '../../src/ProcessContext';

declare module "cucumber" {
  interface World {
    ecc: EventChainContext;
    pc: ProcessContext;
    error: Error;
  }
}

