export interface Threshold {
  color: string; 
  value: number;
  status?: 'b' | 'w' | 'c';
  operator?: "=" | ">" | "<" | ">=" | "!=";
}

export interface Metric {
  refId: string;
  displayText?: string;
  baseColor?: string;
  thresholds?: Threshold[]; 
}

export interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  metric: number;
  sameText?: string;
  color: string; // Цвет для метрики
}

export interface tooltip{
  show: boolean;
  displayMetric?: boolean;
  displayText?: string;
  displayTextColor?: string;
}

export interface Change {
  id: string;
  attributes: {
    fillcolor?: string;
    labeltext?: string;
    labelColor?: string;
    link?: string;
    tooltip?: tooltip[];
    metrics?: Metric[];
  };
}

export interface PanelOptions {
  jsonData: {
    svgCode: string;        // Код SVG
    metricsMapping: string; // Здесь будет YAML
  };
}