import React, { useRef } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Change } from './types';
import { modifySvgAttributes } from './initialize';
import Tooltip, { useTooltip } from './tooltip';
import YAML from 'yaml';

interface Props extends PanelProps<PanelOptions> {}

const SvgPanel: React.FC<Props> = ({ options, data }) => {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgCode = options.jsonData.svgCode || '';
  let changes: Change[] = [];
  let tooldata: { id: string, label: string, color: string, metric: number }[] = [];

  // Check if svgCode is empty
  if (!svgCode) {
    return null; // or return a placeholder element if needed
  }

  const dataFrame = data.series;

  // Attempt to parse metrics mapping
  try {
    const metricsMapping = YAML.parse(options.jsonData.metricsMapping);
    changes = metricsMapping.changes || [];
  } catch (error) {
    console.error('Error parsing metrics mapping:', error);
  }

  // Parse SVG and ensure it is properly set up
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

  // If parsing was successful, modify SVG attributes
  const { modifiedSvg, tooltipData } = modifySvgAttributes(
    new XMLSerializer().serializeToString(doc.documentElement), changes, dataFrame
  );

  tooltipData.forEach(data => {
    if (data.id && data.metric) { // Check for id and metric presence
      tooldata.push({ id: data.id, label: data.label, color: data.color, metric: data.metric });
    }
  });

  // Use the tooltip array
  const tooltips = tooldata.map(e => useTooltip(svgContainerRef, e.id, e.label, e.color, e.metric));

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', height: '100%', width: '100%' }}
      ref={svgContainerRef}
    >
      <div
        dangerouslySetInnerHTML={{ __html: modifiedSvg }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {tooltips.map((tooltip, index) => (
        <Tooltip key={index} {...tooltip} />
      ))}
    </div>
  );
};

export default SvgPanel;
