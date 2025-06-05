
import Papa from 'papaparse';
import { parse } from 'wkt';
import { boundsFromPoints, ShapeType } from '@annotorious/annotorious';
import type { Polygon } from '@annotorious/annotorious';
import simplify from 'simplify-js';

const createMapReaderCSV = () => {

  const parseCSV = (rows: any[]) => rows.map(row => {
    const { pixel_geometry, score, text } = row;

    const geom = parse(pixel_geometry);
    if (geom.type !== 'Polygon')
      throw new Error(`Unsupported type: ${geom.type}`);

    const coordinates = geom.coordinates[0].map(([x, y]) => ({ x, y }));
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

  const readFromURL = (url: string) => new Promise(resolve => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: ((result: any) => {
        const rows = result.data.filter(({ pixel_geometry }) => Boolean(pixel_geometry))  
        const annotations = parseCSV(rows);
        resolve(annotations);
      })
    });
  });

  const read = (csv: string) => new Promise(resolve => {
    Papa.parse(csv, {
      header: true,
      complete: ((result: any) => {
        const rows = result.data.filter(({ pixel_geometry }) => Boolean(pixel_geometry))  
        const annotations = parseCSV(rows);
        resolve(annotations);
      })
    });
  })

  return {
    read,
    readFromURL
  }

}

export default createMapReaderCSV();