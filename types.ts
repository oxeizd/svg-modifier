export interface Threshold {
  color: string; 
  value: number;
  status?: 'b' | 'w' | 'c';
  operator?: "=" | ">" | "<" | ">=" | "!=";
}

export interface Metric {
  refId: string;
  name?: string;
  baseColor?: string;
  thresholds?: Threshold[]; 
}

export interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  label: any;
  metricValue: any;
  color?: any;
}

export interface Change {
  id: string;
  attributes: {
    fillcolor?: string;
    labeltext?: string;
    labelColor?: string;
    link?: string;
    metrics?: Metric[];
  };
}

export interface PanelOptions {
  jsonData: {
    svgCode: string;        // Код SVG
    metricsMapping: string; // Здесь будет YAML
  };
}