import React, { useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Change } from './types';
import { modifySvgAttributes } from './initialize';
import Tooltip, { useTooltip } from './tooltip';
import YAML from 'yaml';

interface Props extends PanelProps<PanelOptions> {}

const SvgPanel: React.FC<Props> = ({ options, data }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const tooltip = useTooltip(svgContainerRef); // Используем хук для получения состояния тултипа

  let svgCode = options.jsonData.svgCode || '';
  let changes: Change[] = [];

  try {
    const metricsMapping = YAML.parse(options.jsonData.metricsMapping);
    changes = metricsMapping.changes || [];
  } catch (error) {
    console.error('Error parsing metrics mapping:', error);
  }

  const dataFrame = data.series;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgCode, 'image/svg+xml');

  const svgElement = doc.getElementsByTagName('svg')[0];
  if (svgElement) {
    svgElement.setAttribute('width', '100%');
    svgElement.setAttribute('height', '100%');
    if (!svgElement.hasAttribute('viewBox')) {
      svgElement.setAttribute('viewBox', '0 0 100 100');
    }
  }

  const modifiedSvgCode = modifySvgAttributes(
    new XMLSerializer().serializeToString(doc.documentElement), changes, dataFrame);

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }}
      ref={svgContainerRef}
    >
      <div
        dangerouslySetInnerHTML={{ __html: modifiedSvgCode }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        label={tooltip.label}
        metricValue={tooltip.metricValue}
      />
    </div>
  );
};

export default SvgPanel;
