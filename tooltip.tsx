import React, { useEffect, useState } from 'react';
import { TooltipProps } from './types';

export const useTooltip = (svgContainerRef: React.RefObject<HTMLDivElement>) => {
  const [tooltip, setTooltip] = useState<TooltipProps>({
    visible: false,
    label: '',
    metricValue: '',
    color: '',
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const cells = Array.from(container.getElementsByTagName('g')).filter((cell) =>
      /^cell-2/.test(cell.id)
    );

    const showTooltip = (event: Event) => {
      const containerRect = svgContainerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltip({
          visible: true,
          label: '',
          metricValue: '',
          color: '',
          x: (event as MouseEvent).clientX - containerRect.left,
          y: (event as MouseEvent).clientY - containerRect.top,
        });
      }
    };

    const hideTooltip = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    cells.forEach((cell) => {
      cell.addEventListener('mouseover', showTooltip);
      cell.addEventListener('mouseout', hideTooltip);
    });

    return () => {
      cells.forEach((cell) => {
        cell.removeEventListener('mouseover', showTooltip);
        cell.removeEventListener('mouseout', hideTooltip);
      });
    };
  }, [svgContainerRef]);

  return tooltip;
};

export const Tooltip: React.FC<TooltipProps> = ({ label, metricValue, color }) => {
  let tooltipContent = '';
  tooltipContent += `<span>${label}: </span>`;
  tooltipContent += `<span style="color: ${color};">${metricValue}</span>`; 
      
  return (
    <div
      style={{
        position: 'absolute',
        transform: 'translate(10px, 10px)',
        backgroundColor: 'white',
        padding: '5px',
        zIndex: 100,
        textAlign: 'center',
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: tooltipContent }} />
    </div>
  );
};

export default Tooltip;
