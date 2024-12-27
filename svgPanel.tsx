import React, { useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Change } from './types';
import { SvgModifier } from './SvgModify';
import { useTooltip, Tooltip } from './tooltip';
import YAML from 'yaml';

interface Props extends PanelProps<PanelOptions> {}

const SvgPanel: React.FC<Props> = ({ options, data }) => {
    const svgContainerRef = useRef<HTMLDivElement>(null);
    const svgCode = options.jsonData.svgCode || '';
    const dataFrame = data.series;

    if (!svgCode) {
        return <div></div>;
    }

    let changes: Change[] = [];
    try {
        const metricsMapping = YAML.parse(options.jsonData.metricsMapping);
        changes = metricsMapping.changes || [];
    } catch (error) {
        console.warn("Error parsing metrics mapping:", error);
    }

    const svgModifier = new SvgModifier(svgCode, changes, dataFrame);
    const { modifiedSvg, tooltipData } = svgModifier.modify();

    // Обновление Tooltip при изменении tooltipData
    const groupedToolData = tooltipData.reduce((acc, data) => {
        if (data.id && data.metric !== undefined) {
            if (!acc[data.id]) {
                acc[data.id] = { id: data.id, values: [] };
            }
            acc[data.id].values.push({ label: data.label, metric: data.metric, color: data.color });
        }
        return acc;
    }, {} as Record<string, { id: string, values: { label: string, metric: number, color: string }[] }>);

    const tooltips = Object.values(groupedToolData).map(data => useTooltip(svgContainerRef, data.id, data.values));

    return (
        <div style={{ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }} ref={svgContainerRef}>
            <div dangerouslySetInnerHTML={{ __html: modifiedSvg }} style={{ width: '100%', height: '100%', display: 'block' }} />
            {tooltips.map((tooltip, index) => (
                <Tooltip key={tooltip.id} {...tooltip} />
            ))}
        </div>
    );
};

export default SvgPanel;