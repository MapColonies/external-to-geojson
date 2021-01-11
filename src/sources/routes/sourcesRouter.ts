import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { validate } from 'openapi-validator-middleware';
import { SourcesController } from '../controllers/sources';

const sourcesRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const controller = dependencyContainer.resolve(SourcesController);

  router.post('/:external_source_name/convert', validate, controller.convertSource);

  return router;
};

export { sourcesRouterFactory };
