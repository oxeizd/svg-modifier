import { Change } from './types'; // Импортируем интерфейсы
import { addLinkToElement } from './link';
import { processMetrics } from './data';

// Определяем интерфейс для тултипов
interface Tooltip {
  show: boolean;
  // Добавьте другие свойства, если они есть
}

export const modifySvgAttributes = (svg: string, changes: Change[], dataFrame: any[]): { modifiedSvg: string, tooltipData: { id: string, label: string, color: string, metric: number }[] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const tooltipData: { id: string, label: string, color: string, metric: number }[] = []; // Массив для хранения данных тултипа

  changes.forEach(({ id, attributes }) => {
    const element = doc.getElementById(id);

    if (!element || !(element instanceof SVGElement)) {
      console.warn(`Element with id "${id}" not found or is not an SVG element.`);
      return; // Пропускаем, если элемент не найден или не является SVG
    }

    try {
      if (attributes) {
        handleAttributes(element, attributes, tooltipData, dataFrame);
      }
    } catch (error) {
      console.error(`Error processing element with id "${id}":`, error);
      // Пропускаем элемент, если возникла ошибка
      return; // Прекращаем обработку для этого id
    }
  });

  return { modifiedSvg: new XMLSerializer().serializeToString(doc.documentElement), tooltipData }; // Возвращаем измененный SVG и данные для тултипа
};

const handleAttributes = (element: SVGElement, attributes: any, tooltipData: any[], dataFrame: any[]) => {
  if (attributes.tooltip) {
    const tooltips: Tooltip[] = Array.isArray(attributes.tooltip) ? attributes.tooltip : [attributes.tooltip];
    
    tooltips.forEach((tip: Tooltip) => {
      if (tip.show) {
        if (attributes.metrics) {
          const { color: newTooltipData } = processMetrics(element, attributes.metrics, dataFrame);
          tooltipData.push(...newTooltipData); // Объединяем данные для тултипа
        }
      }
    });
  }

  if (attributes.metrics) {
    processMetrics(element, attributes.metrics, dataFrame);
  }

  if (attributes.link) {
    addLinkToElement(element, attributes.link);
  }
};
