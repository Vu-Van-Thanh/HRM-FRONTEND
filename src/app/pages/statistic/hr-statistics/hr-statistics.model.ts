import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ApexResponsive } from "ng-apexcharts";

export interface ChartType {
    series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart?: ApexChart;
    dataLabels?: ApexDataLabels;
    plotOptions?: ApexPlotOptions;
    yaxis?: ApexYAxis;
    xaxis?: ApexXAxis;
    fill?: ApexFill;
    tooltip?: ApexTooltip;
    stroke?: ApexStroke;
    legend?: ApexLegend;
    grid?: ApexGrid;
    markers?: ApexMarkers;
    colors?: string[];
    labels?: string[];
    responsive?: ApexResponsive[];
} 