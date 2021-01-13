import { HttpError } from '@map-colonies/error-express-handler';
import httpStatusCodes from 'http-status-codes';
import { container } from 'tsyringe';
import { IExternalData } from '../../../src/sources/models/sourcesManager';

import { registerTestValues } from '../testContainerConfig';
import * as requestSender from './helpers/requestSender';

describe('resourceName', function () {
  beforeAll(async function () {
    registerTestValues();
    await requestSender.init();
  });
  afterEach(function () {
    container.clearInstances();
  });

  describe('Happy Path', function () {
    it('should return 200 status code and external data converted to GeoJson with wkt geometry', async function () {
      const externalSource = 'animels';
      const externalData = {
        geometry: {
          wkt: 'POLYGON((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))',
        },
        attributes: {
          cow: 'moo',
          cat: 'meow',
          dog: 'how',
        },
      };
      const expected = {
        type: 'Feature',
        properties: {
          attributes: {
            cow: 'moo',
            cat: 'meow',
            dog: 'how',
          },
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0.5, 0.5],
              [5, 0],
              [5, 5],
              [0, 5],
              [0.5, 0.5],
            ],
            [
              [1.5, 1],
              [4, 3],
              [4, 1],
              [1.5, 1],
            ],
          ],
        },
      };

      const response = await requestSender.convertSource(externalSource, externalData);

      expect(response.status).toBe(httpStatusCodes.OK);

      const converted = response.body as IExternalData;
      expect(converted).toMatchObject(expected);
    });

    it('should return 200 status code and external data converted to GeoJson with GeoJson geometry', async function () {
      const externalSource = 'vehicles';
      const externalData = {
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [29.0478515625, 54.41892996865827],
              [26.455078125, 55.07836723201515],
              [23.37890625, 53.72271667491848],
              [29.3994140625, 48.951366470947725],
              [29.0478515625, 54.41892996865827],
            ],
          ],
        },
        attributes: {
          cow: 'moo',
          cat: 'meow',
          dog: 'how',
        },
      };
      const expected = {
        type: 'Feature',
        properties: {
          attributes: {
            cow: 'moo',
            cat: 'meow',
            dog: 'how',
          },
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [29.0478515625, 54.41892996865827],
              [26.455078125, 55.07836723201515],
              [23.37890625, 53.72271667491848],
              [29.3994140625, 48.951366470947725],
              [29.0478515625, 54.41892996865827],
            ],
          ],
        },
      };

      const response = await requestSender.convertSource(externalSource, externalData);

      expect(response.status).toBe(httpStatusCodes.OK);

      const converted = response.body as IExternalData;
      expect(converted).toMatchObject(expected);
    });
  });
  describe('Bad Path', function () {
    it('should return 400 and bad Geometry message', async function () {
      const externalSource = 'animels';
      const externalData = {
        geometry: {
          wkt: 'PLYGON((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))',
        },
        attributes: {
          cow: 'moo',
          cat: 'meow',
          dog: 'how',
        },
      };

      const response = await requestSender.convertSource(externalSource, externalData);
      const res = response.body as HttpError;

      expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
      expect(res.message).toBe(`Invalid wkt geometry`);
    });
  });
  describe('Sad Path', function () {
    it('should return 404 and not found source message', async function () {
      const externalSource = 'hatul';
      const externalData = {
        geometry: {
          wkt: 'POLYGON((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))',
        },
        attributes: {
          cow: 'moo',
          cat: 'meow',
          dog: 'how',
        },
      };

      const response = await requestSender.convertSource(externalSource, externalData);
      const res = response.body as HttpError;

      expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
      expect(res.message).toBe(`No schema with external source name = ${externalSource}`);
    });

    it('should return 422 and not found Geometry message', async function () {
      const externalSource = 'animels';
      const externalData = {
        geometry: {
          geo: {
            wkt: 'POLYGON((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))',
          },
        },
        attributes: {
          cow: 'moo',
          cat: 'meow',
          dog: 'how',
        },
      };

      const response = await requestSender.convertSource(externalSource, externalData);
      const res = response.body as HttpError;

      expect(response.status).toBe(httpStatusCodes.UNPROCESSABLE_ENTITY);
      expect(res.message).toBe(`Geometry should locate in: geometry.wkt`);
    });
  });
});
