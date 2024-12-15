import { Metric } from './types';
import { Tooltip } from '@grafana/ui';
export const processMetrics = (element: SVGElement, metrics: Metric[], dataFrame: any[]) => {
  const elementId = element.id;
  const colors: { id: string, refId: string, color: string; priority: number, metric: string }[] = [];

  // Определяем приоритеты статусов
  const statusPriority: { [key: string]: number } = {
    'c': 3, // critical
    'w': 2, // warning
    'b': 1  // good
  };

  metrics.forEach((metric: Metric) => {
    const { refId, baseColor, thresholds } = metric;
    const metricValue = dataFrame.find(frame => frame.refId === refId)?.fields[0]?.values.get(0);

    if (refId && metricValue !== undefined) {
      let metricColor: string = '';
      let metricPriority: number = 0; // Приоритет метрики

      // Сначала проверяем пороги с заданными статусами в порядке c, w, b
      const statusOrder = ['c', 'w', 'b'];
      for (const status of statusOrder) {
        const threshold = thresholds?.find(th => th.status === status && metricValue > th.value);
        if (threshold) {
          metricColor = threshold.color; // Используем цвет из threshold
          metricPriority = statusPriority[status]; // Устанавливаем приоритет на основе статуса
          colors.push({ id: elementId, refId: refId, color: metricColor, priority: metricPriority, metric: metricValue });
          break; // Прерываем цикл, если нашли подходящий порог
        }
      }

      // Если подходящий цвет не найден, проверяем пороги без статусов
      if (colors.length === 0 && thresholds) {
        let maxDifference = -Infinity; // Максимальное расхождение
        let bestThresholdColor = ''; // Цвет с максимальным расхождением

        for (const threshold of thresholds) {
          if (metricValue > threshold.value) {
            const difference = metricValue - threshold.value; // Вычисляем расхождение
            if (difference > maxDifference) {
              maxDifference = difference; // Обновляем максимальное расхождение
              bestThresholdColor = threshold.color; // Сохраняем цвет с максимальным расхождением
            }
          }
        }

        // Если найдено максимальное расхождение, добавляем его в colors
        if (bestThresholdColor) {
          metricColor = bestThresholdColor;
          metricPriority = 1; // Устанавливаем приоритет для порога без статуса
          colors.push({ id: elementId, refId: refId, color: metricColor, priority: metricPriority, metric: metricValue });
        }
      }

      // Если подходящий цвет не найден, используем baseColor
      if (colors.length === 0 && baseColor !== 'none') {
        metricColor = baseColor ?? ''; // Используем оператор нулевого слияния
        if (metricColor !== '') {
          metricPriority = 0; // Устанавливаем приоритет для baseColor
          colors.push({ id: elementId, refId: refId, color: metricColor, priority: metricPriority, metric: metricValue });
        }
      }

      // Применяем цвет ко всем элементам, если был найден подходящий цвет
      if (colors.length > 0) {
        const applyColor = (selector: string, attribute: string) => {
          const elements = element.querySelectorAll<SVGElement>(selector);
          elements.forEach(el => {
            el.setAttribute(attribute, colors[0].color); // Применяем цвет
          });
        };
        applyColor('[fill]', 'fill');
        applyColor('[stroke]', 'stroke');



      }
    }
  });
 
};
