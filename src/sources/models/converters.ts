import { Geometry } from 'geojson';
import { parse } from 'wellknown';
import { GeomertyParseError } from './errors';

interface IConverter {
  (geometry: unknown): Promise<Geometry>;
}

export type Converters = Record<GeoTypes, IConverter>;

function isGeoJson(geometry: unknown): geometry is Geometry {
  const geoJsonTypes = ['Polygon', 'MultiPoint', 'LineString', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
  return geoJsonTypes.includes((geometry as Geometry).type);
}

export async function wktConverter(geometry: unknown): Promise<Geometry> {
  if (!(typeof geometry === 'string')) {
    throw new GeomertyParseError(`Cannot convert geometry to GeoJson geometry`);
  }
  const converted = parse(geometry);
  if (converted === null) {
    throw new GeomertyParseError(`Cannot convert geometry to GeoJson geometry`);
  }
  return Promise.resolve(converted);
}

export async function geoJsonConverter(geometry: unknown): Promise<Geometry> {
  if (!isGeoJson(geometry)) {
    throw new GeomertyParseError(`Cannot convert geometry to GeoJson geometry`);
  }
  return Promise.resolve(geometry);
}

export enum GeoTypes {
  WKT = 'wkt',
  GEO_JSON = 'GeoJson',
}

export const converters: Converters = {
  [GeoTypes.WKT]: wktConverter,
  [GeoTypes.GEO_JSON]: geoJsonConverter,
};
