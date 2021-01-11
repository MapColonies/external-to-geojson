import { RequestHandler } from 'express';
import httpStatus from 'http-status-codes';
import { Feature } from 'geojson';
import { injectable, inject } from 'tsyringe';
import { Services } from '../../common/constants';
import { ILogger } from '../../common/interfaces';
import { SourcesManager, IBodyRecord } from '../models/sourcesManager';
import { HttpError } from '../../common/middlewares/ErrorHandler';
import { GeomertyParseError, GeometryNotFoundError, SchemaNotFoundError } from '../models/errors';

interface SchemaParams {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  external_source_name: string;
}

type SourcesHandler = RequestHandler<SchemaParams, Feature, IBodyRecord>;

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
      if (e instanceof SchemaNotFoundError || e instanceof GeometryNotFoundError) {
        error.status = httpStatus.NOT_FOUND;
      } else if (e instanceof GeometryNotFoundError || e instanceof GeomertyParseError) {
        error.status = httpStatus.BAD_REQUEST;
      } else {
        error.status = httpStatus.INTERNAL_SERVER_ERROR;
      }
      this.logger.log('error', error.message, e);
      return next(error);
    }
    return res.status(httpStatus.OK).json(geoJson);
  };
}
