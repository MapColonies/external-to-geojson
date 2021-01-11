import { SourcesManager } from '../../../../src/sources/models/sourcesManager';
import { ISchema, Schemas } from '../../../../src/sources/models/schemas';
import { GeometryNotFoundError, SchemaNotFoundError, GeomertyParseError } from '../../../../src/sources/models/errors';
import { converters } from '../../../../src/sources/models/converters';
import { GeoTypes } from '../../../../src/sources/models/converters';

let sourcesManager: SourcesManager;
let schemas: Schemas;
let schema: ISchema[];

describe('SourcesManager', () => {
  describe('#convert', () => {
    describe('with wkt geotype', () => {
      beforeEach(function () {
        schema = [{ name: 'animals', geo: { geoType: GeoTypes.WKT, geoLocation: 'geometry.wkt' } }];
        schemas = new Schemas(schema);
        sourcesManager = new SourcesManager({ log: jest.fn() }, schemas, converters);
      });

      it('returns the external data converted to geoJson', async function () {
        const sourceName = 'animals';
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
        const res = {
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

        const converted = await sourcesManager.convert(externalData, sourceName);

        expect(converted).toMatchObject(res);
      });

      it('should throw an error for non exists source', async function () {
        const sourceName = 'hatul';
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

        await expect(sourcesManager.convert(externalData, sourceName)).rejects.toThrow(
          new SchemaNotFoundError(`No schema with external source name = ${sourceName}`)
        );
      });

      it('should throw an error for geometry wrong location', async function () {
        const sourceName = 'animals';
        const externalData = {
          geometry: {
            geometry: {
              wkt: 'POLYGON((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))',
            },
          },
          attributes: {
            cow: 'moo',
            cat: 'meow',
            dog: 'how',
          },
        };

        await expect(sourcesManager.convert(externalData, sourceName)).rejects.toThrow(
          new GeometryNotFoundError(`Geometry should locate in: geometry.wkt`)
        );
      });

      it('should throw an error for wrong geometry value (typo of string)', async function () {
        const sourceName = 'animals';
        const externalData = {
          geometry: {
            wkt: 'POLY((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))',
          },
          attributes: {
            cow: 'moo',
            cat: 'meow',
            dog: 'how',
          },
        };

        await expect(sourcesManager.convert(externalData, sourceName)).rejects.toThrow(
          new GeomertyParseError(`Cannot convert geometry to geoJson geometry`)
        );
      });

      it('should throw an error for wrong geometry value (number instead of string)', async function () {
        const sourceName = 'animals';
        const externalData = {
          geometry: {
            wkt: 3000,
          },
          attributes: {
            cow: 'moo',
            cat: 'meow',
            dog: 'how',
          },
        };

        await expect(sourcesManager.convert(externalData, sourceName)).rejects.toThrow(
          new GeomertyParseError(`Cannot convert geometry to geoJson geometry`)
        );
      });
    });

    describe('with geojson geotype', () => {
      beforeEach(function () {
        schema = [{ name: 'animals', geo: { geoType: GeoTypes.GEO_JSON, geoLocation: 'geometry' } }];
        schemas = new Schemas(schema);
        sourcesManager = new SourcesManager({ log: jest.fn() }, schemas, converters);
      });

      it('should return the external data converted to geoJson', async function () {
        const sourceName = 'animals';
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
        const res = {
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

        const converted = await sourcesManager.convert(externalData, sourceName);

        expect(converted).toMatchObject(res);
      });

      it('should throw an error for wrong geometry value (geojson format)', async function () {
        const sourceName = 'animals';
        const externalData = {
          geometry: {
            type: 'Plygon',
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

        await expect(sourcesManager.convert(externalData, sourceName)).rejects.toThrow(
          new GeomertyParseError(`Cannot convert geometry to geoJson geometry`)
        );
      });
    });
  });
});
