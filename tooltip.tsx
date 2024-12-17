import React, { useEffect, useState, useCallback } from 'react';
import { TooltipProps } from './types';

export const useTooltip = (svgContainerRef: React.RefObject<HTMLDivElement>, id: string, label: string, color: string, metric: number) => {
  const [tooltip, setTooltip] = useState<TooltipProps>({
    visible: false,
    label: '',
    x: 0,
    y: 0,
    color: '',
    metric: 0,
  });

  const handleTooltip = useCallback((event: MouseEvent | null) => {
    const containerRect = svgContainerRef.current?.getBoundingClientRect();
    if (event) {
      setTooltip({
        visible: true,
        label: label, // Здесь можно оставить 'No metric' или изменить на другое значение
        color: color,
        metric: metric,
        x: event.clientX - (containerRect?.left || 0),
        y: event.clientY - (containerRect?.top || 0),
      });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [svgContainerRef, metric]);

  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const cells = Array.from(container.getElementsByTagName('g')).filter(cell => cell.id === id);

    if (cells.length === 0) {
      console.warn(`No elements found with id: ${id}`); // Предупреждение, если элементы не найдены
    }

    cells.forEach(cell => {
      cell.addEventListener('mouseover', handleTooltip);
      cell.addEventListener('mouseout', () => handleTooltip(null));
    });

    return () => {
      cells.forEach(cell => {
        cell.removeEventListener('mouseover', handleTooltip);
        cell.removeEventListener('mouseout', () => handleTooltip(null));
      });
    };
  }, [svgContainerRef, handleTooltip, id]);

  return tooltip;
}; 

const Tooltip: React.FC<TooltipProps> = ({ visible , x, y, label, color, metric }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: '5px',
        left: x + 20,
        top: y,
        backgroundColor: '#26252D',
        padding: '5px',
        textAlign: 'center',
      }}
    >
      <span>
      <span style={{ color: '#fff' }}>{label}: </span>
      <span style={{ color }}>{metric}</span>
      </span>
    </div>
  );
};

export default Tooltip;