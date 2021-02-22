import express from 'express';
import bodyParser from 'body-parser';
import { middleware as OpenApiMiddleware } from 'express-openapi-validator';
import { OpenapiViewerRouter, OpenapiRouterConfig } from '@map-colonies/openapi-express-viewer';
import { container, inject, injectable } from 'tsyringe';
import { getErrorHandlerMiddleware } from '@map-colonies/error-express-handler';
import { RequestLogger } from './common/middlewares/RequestLogger';
import { Services } from './common/constants';
import { IConfig, ILogger } from './common/interfaces';
import { sourcesRouterFactory } from './sources/routes/sourcesRouter';

@injectable()
export class ServerBuilder {
  private readonly serverInstance: express.Application;

  public constructor(
    @inject(Services.LOGGER) private readonly logger: ILogger,
    @inject(Services.CONFIG) private readonly config: IConfig,
    private readonly requestLogger: RequestLogger
  ) {
    this.serverInstance = express();
  }

  public build(): express.Application {
    this.registerMiddleware();
    this.buildRoutes();

    return this.serverInstance;
  }

  private buildDocsRoutes(): void {
    const openapiRouter = new OpenapiViewerRouter(this.config.get<OpenapiRouterConfig>('openapiConfig'));
    openapiRouter.setup();
    this.serverInstance.use(this.config.get<string>('openapiConfig.basePath'), openapiRouter.getRouter());
  }

  private buildRoutes(): void {
    this.logger.log('debug', 'registering service routes');

    this.buildDocsRoutes();
    this.serverInstance.use('/sources', sourcesRouterFactory(container));
    this.serverInstance.use(getErrorHandlerMiddleware((message) => this.logger.log('error', message)));
  }

  private registerMiddleware(): void {
    this.logger.log('debug', 'Registering middlewares');
    this.serverInstance.use(bodyParser.json());

    const ignorePathRegex = new RegExp(`^${this.config.get<string>('openapiConfig.basePath')}/.*`, 'i');
    const apiSpecPath = this.config.get<string>('openapiConfig.filePath');
    this.serverInstance.use(OpenApiMiddleware({ apiSpec: apiSpecPath, validateRequests: true, ignorePaths: ignorePathRegex }));
    this.serverInstance.use(this.requestLogger.getLoggerMiddleware());
  }
}
