// tooltip.tsx
import React, { useState, useEffect } from 'react';
import { TooltipProps } from './types';

export const Tooltip: React.FC<TooltipProps> = ({ visible, x, y, content }) => {
    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            backgroundColor: '#26252D',
            padding: '5px',
            borderRadius: '5px',
            zIndex: 9999,
            pointerEvents: 'none', // Чтобы Tooltip не мешал взаимодействию с элементами
        }}>
            {content.map((item, index) => (
                <div key={index} style={{ color: item.color }}>
                    <span style={{ color: '#fff' }}>{item.label}: </span>
                    <span>{item.metric}</span>
                </div>
            ))}
        </div>
    );
};

export const useTooltip = (svgContainerRef: React.RefObject<HTMLDivElement>, id: string, values: { label: string, metric: number, color: string }[]) => {
    const [tooltip, setTooltip] = useState<TooltipProps>({
        visible: false,
        x: 0,
        y: 0,
        id: '',
        content: [],
    });

    const handleTooltip = (event: MouseEvent | null) => {
        if (event) {
            const containerRect = svgContainerRef.current?.getBoundingClientRect();
            setTooltip({
                visible: true,
                x: event.clientX - (containerRect?.left || 0),
                y: event.clientY - (containerRect?.top || 0),
                id: id,
                content: values,
            });
        } else {
            setTooltip(prev => ({ ...prev, visible: false }));
        }
    };

    const handleMouseOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest(`#${id}`)) {
            handleTooltip(event);
        }
    };

    const handleMouseOut = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.closest(`#${id}`)) {
            handleTooltip(null);
        }
    };

    useEffect(() => {
        const container = svgContainerRef.current;
        if (container) {
            container.addEventListener('mouseover', handleMouseOver);
            container.addEventListener('mouseout', handleMouseOut);
        }

        return () => {
            if (container) {
                container.removeEventListener('mouseover', handleMouseOver);
                container.removeEventListener('mouseout', handleMouseOut);
            }
        };
    }, [svgContainerRef, id, values]);

    return tooltip;
};
