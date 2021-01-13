import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { Feature } from 'geojson';
import { injectable, inject } from 'tsyringe';
import { HttpError } from '@map-colonies/error-express-handler';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { SourcesManager, IExternalData } from '../models/sourcesManager';
import { GeomertyParseError, GeometryNotFoundError, SchemaNotFoundError } from '../models/errors';

interface SchemaParams {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  external_source_name: string;
}

type SourcesHandler = RequestHandler<SchemaParams, Feature, IExternalData>;

@injectable()
export class SourcesController {
  public constructor(@inject(Services.LOGGER) private readonly logger: ILogger, @inject(SourcesManager) private readonly manager: SourcesManager) {}

  public convertSource: SourcesHandler = async (req, res, next) => {
    const sourceName = req.params['external_source_name'];
    let geoJson: Feature;

    try {
      geoJson = await this.manager.convert(req.body, sourceName);
    } catch (e) {
      const error = e as HttpError;
      if (e instanceof SchemaNotFoundError) {
        error.statusCode = httpStatus.NOT_FOUND;
      } else if (e instanceof GeomertyParseError) {
        error.statusCode = httpStatus.BAD_REQUEST;
      } else if (e instanceof GeometryNotFoundError) {
        error.statusCode = httpStatus.UNPROCESSABLE_ENTITY;
      }
      this.logger.log('error', error.message, e);
      return next(error);
    }
    return res.status(httpStatus.OK).json(geoJson);
  };
}
