import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { serializeW3CImageAnnotation } from '@annotorious/annotorious';
import MapReaderCSV from '../src/mapreader-csv';

const FILENAME = 'foo'

console.log('Converting file: ' + FILENAME);

const str = fs.readFileSync('./public/maps/test_predictions.csv', 'utf8');
MapReaderCSV.read(str).then((partials: any) => {

  // Turn into full-blown annotation objects
  const annotations = partials.map(partial => {
    const id = uuidv4();

    const anno = {
      id,
      ...partial,
      bodies: partial.bodies.map((body: any) => ({
        annotation: id,
        ...body
      })),
      target: {
        annotation: id,
        ...partial.target
      }
    }

    return serializeW3CImageAnnotation(anno, FILENAME);
  });

  console.log(JSON.stringify(annotations, null, 2));
});
