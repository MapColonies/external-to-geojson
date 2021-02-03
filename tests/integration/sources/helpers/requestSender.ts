import * as supertest from 'supertest';
import { Application } from 'express';
import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export async function init(): Promise<void> {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = await builder.build();
}

export async function convertSource(externalSourceName: string, externalData: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/sources/${externalSourceName}/convert`).send(externalData);
}
