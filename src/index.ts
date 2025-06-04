import OpenSeadragon from 'openseadragon';
import { createOSDAnnotator, UserSelectAction, type ImageAnnotation } from '@annotorious/openseadragon';
import MapReaderCSV from './mapreader-csv';

import '@annotorious/openseadragon/annotorious-openseadragon.css';

const OFFSET = 10;

window.onload = function() {
  const viewer = OpenSeadragon({
    id: 'openseadragon',
    prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@3.1/build/openseadragon/images/', 
    gestureSettingsMouse: {
      clickToZoom: false
    },
    tileSources: {
      type: 'image',
      url: 'maps/novus_atlas.jpg'
    },
    minZoomLevel: 0.1,
    maxZoomLevel: 100
  });

  const tooltip = document.getElementById('tooltip');

  const anno = createOSDAnnotator(viewer, {
    userSelectAction: UserSelectAction.NONE,
    style: {
      stroke: '#00aa00',
      strokeOpacity: 0.7,
      fill: '#00ee00',
      fillOpacity: 0.18
    }
  });

  MapReaderCSV
    .readFromURL('maps/novus_atlas_predictions.csv')
    .then((annotations: ImageAnnotation[]) => 
      anno.setAnnotations(annotations));
  
  document.body.addEventListener('pointermove', evt => {
    tooltip.style.left = `${evt.clientX + OFFSET}px`;
    tooltip.style.top = `${evt.clientY + OFFSET}px`;
  });
  
  anno.on('mouseEnterAnnotation', function(annotation) {
    const text = annotation.bodies.find(b => !b.purpose)?.value;
    const score = annotation.bodies.find(b => b.purpose === 'scoring')?.value;

    tooltip.innerHTML = `${text} <span class="score">(${score})</span>`;
    tooltip.style.display = 'block';
  });

  anno.on('mouseLeaveAnnotation', function(annotation) {
    tooltip.style.display = 'none';
  });
}