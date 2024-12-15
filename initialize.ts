import { Change } from './types'; // Импортируем интерфейсы
import { addLinkToElement } from './link';
import { processMetrics } from './data';
import { Tooltip } from '@grafana/ui';

export const modifySvgAttributes = (svg: string, changes: Change[], dataFrame: any[]): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');

  changes.forEach((change: Change) => {
    const { id, attributes } = change;
    const element = doc.getElementById(id);

    if (element && element instanceof SVGElement) {
      if (attributes) {
        if (attributes.metrics) processMetrics(element, attributes.metrics, dataFrame);
        if (attributes.link) addLinkToElement(element, attributes.link);
      }
    }
  });

  return new XMLSerializer().serializeToString(doc.documentElement);
};

