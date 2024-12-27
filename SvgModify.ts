import { Change } from './types';
import { LinkManager } from './addLink';
import { MetricProcessor } from './getData';

export class SvgModifier {
    private svg: string;
    private changes: Change[];
    private dataFrame: any[];

    constructor(svg: string, changes: Change[], dataFrame: any[]) {
        this.svg = svg;
        this.changes = changes;
        this.dataFrame = dataFrame;
    }

    public modify(): { modifiedSvg: string, tooltipData: { id: string, label: string, color: string, metric: number }[] } {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.svg, 'image/svg+xml');
        const tooltipData: { id: string, label: string, color: string, metric: number }[] = [];

        const svgElement = doc.documentElement;
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        if (!svgElement.hasAttribute('viewBox')) {
            svgElement.setAttribute('viewBox', '0 0 100 100');
        }

        this.changes.forEach(({ id, attributes }: Change) => {
            const element = doc.getElementById(id);
            
            if (!(element instanceof SVGElement)) {
                console.warn(`Element with id ${id} not found or is not an SVG element. Skipping...`);
                return; // Пропускаем обработку, если элемент не найден
            }
        
            try {
                this.processAttributes(element, attributes, tooltipData);
            } catch (error) {
                console.error(`Error processing attributes for element with id ${id}:`, error);
            }
        });

        return { modifiedSvg: new XMLSerializer().serializeToString(doc.documentElement), tooltipData };
    }

    private processAttributes(element: SVGElement, attributes: any, tooltipData: any[]) {
        const { tooltip, metrics, link } = attributes || {};

        if (metrics) {
            const metricProcessor = new MetricProcessor(element, metrics, this.dataFrame);
            metricProcessor.process();

            if (tooltip) {
                this.processTooltip(element, tooltip, metricProcessor, tooltipData);
            }
        }

        if (link) {
            LinkManager.addLinkToElement(element, link);
        }
    }

    private processTooltip(element: SVGElement, tooltip: any, metricProcessor: MetricProcessor, tooltipData: any[]) {
        const tooltipsArray = Array.isArray(tooltip) ? tooltip : [tooltip];
        tooltipsArray.forEach(tip => {
            if (tip.show) {
                const { color: newTooltipData } = metricProcessor.process();
                tooltipData.push(...newTooltipData);
            }
        });
    
        // Очистка тултипов, если элемент больше не существует
        if (!document.getElementById(element.id)) {
            tooltipData = tooltipData.filter(data => data.id !== element.id);
        }
    }
}
