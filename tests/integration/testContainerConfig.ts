import { readFileSync } from 'fs';
import { container } from 'tsyringe';
import config from 'config';
import { MCLogger, IServiceConfig } from '@map-colonies/mc-logger';
import { Services } from '../../src/common/constants';
import { ISchema } from '../../src/sources/models/schemas';
import { converters } from '../../src/sources/models/converters';

function registerTestValues(): void {
  const packageContent = readFileSync('./package.json', 'utf8');
  const service = JSON.parse(packageContent) as IServiceConfig;
  const logger = new MCLogger({ log2console: true, level: 'error' }, service);
  const schemaFile = readFileSync(config.get('schema.filePath'), 'utf8');
  const schema = JSON.parse(schemaFile) as Record<string, ISchema>;

  container.register(Services.CONFIG, { useValue: config });
  container.register(Services.LOGGER, { useValue: logger });
  container.register(Services.SCHEMA, { useValue: schema });
  container.register('converters', { useValue: converters });
}

export { registerTestValues };
