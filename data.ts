import { Metric, Threshold } from './types';

export const processMetrics = (element: SVGElement, metrics: Metric[], dataFrame: any[]): { color: { id: string, label: string, color: string, metric: number }[] } => {
    const elementId = element.id;
    const color: { id: string, label: string, color: string, metric: number }[] = [];
    const valueMap = new Map<string, number>();

    // Заполняем valueMap
    dataFrame.forEach(frame => {
        const metricValue = frame.fields[0]?.values.get(0);
        if (metricValue !== undefined) {
            valueMap.set(frame.refId, metricValue);
        }
    });

    metrics.forEach((metric: Metric) => {
        const { refId, baseColor, thresholds, displayText } = metric;
        const metricValue = valueMap.get(refId);

        if (refId && metricValue !== undefined) {
            const metricColor = determineMetricColor(metricValue, thresholds, baseColor);
            const label = displayText || refId;
            const colorValue = metricColor || '#fff';

            color.push({ id: elementId, label, color: colorValue, metric: metricValue });
            applyColorToElements(element, metricColor || '#fff');
        }
    });

    return { color };
};

const determineMetricColor = (metricValue: number, thresholds: Threshold[] | undefined, baseColor: string | undefined): string => {
    if (!thresholds) return baseColor !== 'none' ? baseColor ?? '' : '';

    // Проверяем пороги с заданными статусами
    const statusOrder = ['c', 'w', 'b'];
    for (const status of statusOrder) {
        const threshold = thresholds.find(th => th.status === status && metricValue > th.value);
        if (threshold) return threshold.color;
    }

    // Проверяем пороги без статусов
    const bestThresholdColor = thresholds.reduce((bestColor, threshold) => {
        return (metricValue > threshold.value && threshold.color) || bestColor;
    }, '');

    return bestThresholdColor || (baseColor !== 'none' ? baseColor ?? '' : '');
};

const applyColorToElements = (element: SVGElement, color: string) => {
    const applyColor = (selector: string, attribute: string) => {
        const elements = element.querySelectorAll<SVGElement>(selector);
        elements.forEach(el => el.setAttribute(attribute, color));
    };
    applyColor('[fill]', 'fill');
    applyColor('[stroke]', 'stroke');
};
