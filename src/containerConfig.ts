import { readFileSync } from 'fs';
import { container } from 'tsyringe';
import config from 'config';
import Ajv from 'ajv';
import { Probe } from '@map-colonies/mc-probe';
import { MCLogger, ILoggerConfig, IServiceConfig } from '@map-colonies/mc-logger';
import { Services } from './common/constants';
import { ISchema } from './sources/models/schemas';
import { converters } from './sources/models/converters';

function registerExternalValues(): void {
  const loggerConfig = config.get<ILoggerConfig>('logger');
  const packageContent = readFileSync('./package.json', 'utf8');
  const service = JSON.parse(packageContent) as IServiceConfig;
  const logger = new MCLogger(loggerConfig, service);

  const schemaFile = readFileSync(config.get('schema.filePath'), 'utf8');
  const schema = JSON.parse(schemaFile) as Record<string, ISchema>;

  const validationJsonSchemaFile = readFileSync('./validationJsonSchema.json', 'utf8');
  const validationJsonSchema = JSON.parse(validationJsonSchemaFile) as Record<string, ISchema>;
  const validate = new Ajv().compile(validationJsonSchema);

  if (!validate(schema)) {
    throw new Error('schema is not valid');
  }

  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: logger });
  container.register(Services.SCHEMA, { useValue: schema });
  container.register('converters', { useValue: converters });
  container.register<Probe>(Probe, { useFactory: (container) => new Probe(container.resolve(Services.LOGGER), {}) });
}
export { registerExternalValues };
