import { DataFrame, FieldType } from '@grafana/data';
import { Metric, Threshold } from './types';

export class MetricProcessor {
    private element: SVGElement;
    private metrics: Metric[];
    private dataFrame: DataFrame[];

    constructor(element: SVGElement, metrics: Metric[], dataFrame: DataFrame[]) {
        this.element = element;
        this.metrics = metrics;
        this.dataFrame = dataFrame;
    }

    public process(): { color: { id: string, refId: string, label: string, color: string, metric: any }[] } {
        const elementId = this.element.id;
        const colorData: { id: string, refId: string, label: string, color: string, metric: any }[] = [];
        const valueMap = this.createValueMap();
        const maxColorMap: Map<string, { color: string, value: number }> = new Map();
    
        this.metrics.forEach((metric: Metric) => {
            const { data, baseColor, thresholds, displayText } = metric;
            let refId: string | undefined;
            let legend: string | undefined;
    
            // Извлекаем refId или legend из data
            if ('refId' in data) {
                refId = data.refId;
            } else
            if ('legend' in data) {
                legend = data.legend;
            }
    
            // Обработка legend
            if (legend) {
                for (const [key, value] of valueMap.entries()) {
                    if (value.displayNames.includes(legend)) {
                        value.values.forEach((value, index) => {
                            const metricColor = this.determineMetricColor(value, thresholds, baseColor);
                            const colorValue = metricColor || '#fff';
                            colorData.push({ id: elementId, refId: key, label: legend, color: colorValue, metric: value });
    
                            // Сохраняем максимальный цвет и значение для данного refId
                            const currentMax = maxColorMap.get(key);
                            if (!currentMax || value > currentMax.value) {
                                maxColorMap.set(key, { color: colorValue, value });
                            }
                        });
                    }
                }
            } else if (refId) {
                const metricData = valueMap.get(refId);
    
                if (metricData) {
                    metricData.values.forEach((value, index) => {
                        const displayName = metricData.displayNames[index]; // Получаем соответствующий displayName
                        const metricColor = this.determineMetricColor(value, thresholds, baseColor);
                        const colorValue = metricColor || '#fff';
                        colorData.push({ id: elementId, refId: refId, label: displayText || displayName, color: colorValue, metric: value });
    
                        // Сохраняем максимальный цвет и значение для данного refId
                        const currentMax = maxColorMap.get(refId);
                        if (!currentMax || value > currentMax.value) {
                            maxColorMap.set(refId, { color: colorValue, value });
                        }
                    });
                }
            }
        });
    
        // Применяем максимальные цвета к элементам
        maxColorMap.forEach((colorInfo, refId) => {
            this.applyColorToElements(colorInfo.color); // Применяем цвет для каждого refId
        });
    
        return { color: colorData };
    }
    
    private createValueMap(): Map<string, { values: number[], displayNames: string[] }> {
        const valueMap = new Map<string, { values: number[], displayNames: string[] }>();

        this.dataFrame.forEach((frame: DataFrame) => {
            const metricValueField = frame.fields.find(field => field.type === FieldType.number);
            
            if (!metricValueField) {
                return; // Если не найден, пропускаем текущий frame
            }

            const displayNameFromDS = metricValueField.config?.displayNameFromDS;
            const refId = frame.refId; // Получаем refId

            if (refId) { // Проверяем, что refId не undefined
                const value = metricValueField.values.get(metricValueField.values.length - 1);
                if (value !== undefined) {
                    const formattedValue = parseFloat(value.toFixed(2)); // Преобразуем обратно в число, если нужно

                    // Если уже есть значения для этого refId, добавляем новое значение и displayName
                    if (!valueMap.has(refId)) {
                        valueMap.set(refId, { values: [], displayNames: [] });
                    }
                    valueMap.get(refId)?.values.push(formattedValue); // Добавляем значение в массив
                    valueMap.get(refId)?.displayNames.push(displayNameFromDS || refId); // Добавляем displayName в массив
                }
            }
        });

        return valueMap;
    }
    
    private determineMetricColor(metricValue: any, thresholds: Threshold[] | undefined, baseColor: string | undefined): string {
        if (!thresholds) return baseColor !== 'none' ? baseColor ?? '' : '';
    
        let selectedColor: string | undefined;
    
        // Проверяем каждый порог
        for (const threshold of thresholds) {
            if (metricValue >= threshold.value) {
                // Если значение превышает порог, обновляем выбранный цвет
                selectedColor = threshold.color; // Сохраняем цвет текущего порога
            }
        }
    
        // Если ни один порог не был превышен, возвращаем базовый цвет
        return selectedColor ?? (baseColor !== 'none' ? baseColor ?? '' : '');
    }
    
    private applyColorToElements(color: string) {
        const elements = this.element.querySelectorAll<SVGElement>('[fill], [stroke]');
        elements.forEach(el => {
            if (el.hasAttribute('fill')) {
                el.setAttribute('fill', color);
            }
            if (el.hasAttribute('stroke')) {
                el.setAttribute('stroke', color);
            }
        });
    }
}