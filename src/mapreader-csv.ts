
import Papa from 'papaparse';
import { parse } from 'wkt';
import { boundsFromPoints, ShapeType } from '@annotorious/annotorious';
import type { Polygon } from '@annotorious/annotorious';
import simplify from 'simplify-js';

const createMapReaderCSV = () => {

  const readFromURL = (url: string) => new Promise(resolve => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: ((result: any) => {
        const annotations = result.data
          .filter(({ pixel_geometry }) => Boolean(pixel_geometry))  
          .map((record: any) => {
            const { pixel_geometry, score, text } = record;

            const parsed = parse(pixel_geometry);

            if (parsed.type !== 'Polygon')
              throw new Error(`Unsupported type: ${parsed.type}`);

            const coordinates = parsed.coordinates[0].map(([x, y]) => ({ x, y }));
            const simplified = simplify(coordinates, 1, true).map(({ x, y }) => ([x, y])) as [number, number][];

            const polygon: Polygon = {
              type: ShapeType.POLYGON,
              geometry: {
                bounds: boundsFromPoints(simplified),
                points: simplified
              }
            };

            return {
              bodies: [{ 
                value: text 
              }, {
                purpose: 'scoring',
                value: score
              }],
              target: {
                selector: polygon
              }
            }
          });

        resolve(annotations);
      })
    })
  });

  return {
    readFromURL
  }

}

export default createMapReaderCSV();