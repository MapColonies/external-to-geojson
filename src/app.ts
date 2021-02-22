import { container } from 'tsyringe';
import { Application } from 'express';
import { registerExternalValues } from './containerConfig';
import { ServerBuilder } from './serverBuilder';

function getApp(): Application {
  registerExternalValues();
  return container.resolve(ServerBuilder).build();
}

export { getApp };
