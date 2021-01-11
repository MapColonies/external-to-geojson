import { inject, injectable } from 'tsyringe';
import { Services } from '../../common/constants';
import { GeoTypes } from './converters';

export interface ISchema {
  name: string;
  geo: {
    geoType: GeoTypes;
    geoLocation: string;
  };
}

@injectable()
export class Schemas {
  public constructor(@inject(Services.SCHEMA) private readonly schemas: ISchema[]) {}
  public getSchema = async (name: string): Promise<ISchema | undefined> => {
    return Promise.resolve(this.schemas.find((schema) => schema.name === name));
  };
}
