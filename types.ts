export interface Threshold {
  color: string; 
  value: number;
  status?: 'b' | 'w' | 'c';
  operator?: "=" | ">" | "<" | ">=" | "!=";
  condition?: string;
}

type DataField = { refId: string } | { legend: string };

export interface Metric {
  data: DataField;
  displayText?: string;
  baseColor?: string;
  thresholds?: Threshold[];
}

export interface TooltipMetric {
  label: string; // Название метрики
  metric: number; // Значение метрики
  color: string; // Цвет для метрики
  dateTime?: Date;
}

export interface TooltipProps {
  visible: boolean; // Видимость тултипа
  x: number; // Координата X
  y: number; // Координата Y
  content: TooltipMetric[]; // Массив метрик для отображения
  id?: string; // Идентификатор тултипа
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