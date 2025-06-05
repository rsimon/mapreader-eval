import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';
import { serializeW3CImageAnnotation } from '@annotorious/annotorious';
import MapReaderCSV from '../src/mapreader-csv';

const FILENAME = 'EST_VH-560-FOL + VD-29 (3)-FT 6_Page_19'

console.log('Converting file: ' + FILENAME);

const str = fs.readFileSync('./public/maps/test_predictions.csv', 'utf8');
MapReaderCSV.read(str).then((partials: any) => {

  // Turn into full-blown annotation objects
  const annotations = partials.map(partial => {
    const id = uuidv4();

    const text = partial.bodies.find(b => !b.purpose)?.value;
    const score = partial.bodies.find(b => b.purpose === 'scoring')?.value;

    const anno = {
      id,
      ...partial,
      bodies: [{
        id: uuidv4(),
        type: "TextualBody",
        annotation: id,
        purpose: 'commenting',
        value: `${text} (${score})`,
        created: new Date()
      }],
      target: {
        annotation: id,
        ...partial.target
      }
    }

    return serializeW3CImageAnnotation(anno, FILENAME);
  });

  fs.writeFileSync(`./scripts/output/${FILENAME}.json`, JSON.stringify(annotations, null, 2), 'utf8');
});
