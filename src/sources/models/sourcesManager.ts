import _ from 'lodash';
import { inject, injectable } from 'tsyringe';
import { Feature } from 'geojson';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { Schemas } from './schemas';
import { GeometryNotFoundError, SchemaNotFoundError } from './errors';
import { Converters } from './converters';

export type IBodyRecord = Record<string, unknown>;

@injectable()
export class SourcesManager {
  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(Schemas) private readonly schemas: Schemas,
    @inject('converters') private readonly converters: Converters
  ) {}

  public async convert(body: IBodyRecord, sourceName: string): Promise<Feature> {
    const feature = {
      type: 'Feature',
      properties: {},
      geometry: {},
    } as Feature;

    const schema = await this.schemas.getSchema(sourceName);
    if (schema === undefined) {
      throw new SchemaNotFoundError(`No schema with external source name = ${sourceName}`);
    }

    const geometry = _.get(body, schema.geo.geoLocation);
    if (geometry === undefined) {
      throw new GeometryNotFoundError(`Geometry should locate in: ${schema.geo.geoLocation}`);
    }

    feature.geometry = await this.converters[schema.geo.geoType](geometry);
    feature.properties = body;

    const returnFeature = _.omit(feature, `properties.${schema.geo.geoLocation}`) as Feature;
    return returnFeature;
  }
}
