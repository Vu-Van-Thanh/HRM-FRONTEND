import { ChartType } from "./hr-statistics.model";

/**
 * Education Level Chart Options
 */
const educationChartOptions: ChartType = {
  series: [45, 30, 25],
  chart: {
    height: 320,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      offsetY: 0,
      startAngle: 0,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '30%',
        background: 'transparent',
        image: undefined,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          show: false,
        }
      }
    }
  },
  colors: ['#556ee6', '#34c38f', '#f46a6a'],
  labels: ['Đại học', 'Cao đẳng', 'Trung cấp'],
  legend: {
    show: true,
    floating: false,
    fontSize: '14px',
    position: 'bottom',
    horizontalAlign: 'center',
    offsetX: 0,
    offsetY: 5,
    labels: {
      useSeriesColors: true,
    },
    formatter: function(seriesName, opts) {
      return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
    },
    itemMargin: {
      horizontal: 3,
    }
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 240,
        },
        legend: {
          show: false,
        },
      },
    },
  ],
};

/**
 * Department Chart Options
 */
const departmentChartOptions: ChartType = {
  series: [25, 15, 30, 20, 10],
  chart: {
    height: 320,
    type: 'pie',
  },
  labels: ['Back Office', 'Lãnh đạo', 'Kinh doanh', 'Kĩ thuật', 'Marketing'],
  colors: ['#556ee6', '#34c38f', '#f46a6a', '#50a5f1', '#f1b44c'],
  legend: {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    floating: false,
    fontSize: '14px',
    offsetX: 0,
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 240,
        },
        legend: {
          show: false,
        },
      },
    },
  ],
};

/**
 * Gender Ratio Chart Options
 */
const genderRatioChartOptions: ChartType = {
  series: [60, 40],
  chart: {
    height: 320,
    type: 'donut',
  },
  labels: ['Nam', 'Nữ'],
  colors: ['#556ee6', '#f46a6a'],
  legend: {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    floating: false,
    fontSize: '14px',
    offsetX: 0,
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 240,
        },
        legend: {
          show: false,
        },
      },
    },
  ],
};

/**
 * Average Salary Chart Options
 * Biểu đồ hiển thị lương trung bình, thấp nhất và cao nhất theo từng phòng ban
 */
const averageSalaryChartOptions: ChartType = {
  series: [
    {
      name: 'Lương trung bình',
      type: 'column',
      data: [25, 18, 20, 35, 22]
    },
    {
      name: 'Lương thấp nhất',
      type: 'column',
      data: [18, 12, 15, 28, 16]
    },
    {
      name: 'Lương cao nhất',
      type: 'column',
      data: [38, 25, 30, 55, 32]
    }
  ],
  chart: {
    height: 350,
    type: 'bar',
    stacked: false,
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 4,
      dataLabels: {
        position: 'top',
      },
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val + " tr";
    },
    offsetY: -20,
    style: {
      fontSize: '11px',
      colors: ['#304758']
    }
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['IT', 'Hành chính', 'Kế toán', 'Lãnh đạo', 'Marketing'],
    position: 'bottom',
    labels: {
      show: true,
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    title: {
      text: 'Mức lương (triệu VND)'
    },
    min: 0,
    max: 60
  },
  fill: {
    opacity: 1
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right'
  },
  colors: ['#34c38f', '#556ee6', '#f46a6a'],
  tooltip: {
    y: {
      formatter: function (val) {
        return val + " triệu VND";
      }
    }
  }
};

/**
 * Department by Gender Chart Options
 */
const departmentGenderChartOptions: ChartType = {
  series: [
    {
      name: 'Nam',
      data: [15, 8, 20, 15, 6]
    },
    {
      name: 'Nữ',
      data: [10, 7, 10, 5, 4]
    }
  ],
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
    toolbar: {
      show: false
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '15%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ['Back Office', 'Lãnh đạo', 'Kinh doanh', 'Kĩ thuật', 'Marketing'],
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    offsetY: 5
  },
  fill: {
    opacity: 1
  },
  colors: ['#556ee6', '#f46a6a']
};

/**
 * Employee Skills Radar Chart
 */
const employeeSkillsChartOptions: ChartType = {
  series: [
    {
      name: 'Kỹ năng trung bình',
      data: [80, 65, 75, 70, 85, 60],
    }
  ],
  chart: {
    height: 350,
    type: 'radar',
  },
  dataLabels: {
    enabled: true
  },
  plotOptions: {
    radar: {
      size: 140,
      polygons: {
        strokeColors: '#e9e9e9',
        fill: {
          colors: ['#f8f8f8', '#fff']
        }
      }
    }
  },
  colors: ['#FF4560'],
  markers: {
    size: 4,
    colors: ['#FF4560'],
    strokeWidth: 2,
  },
  tooltip: {
    y: {
      formatter: function(val) {
        return val + "%";
      }
    }
  },
  xaxis: {
    categories: ['Kỹ năng chuyên môn', 'Quản lý thời gian', 'Làm việc nhóm', 'Giải quyết vấn đề', 'Giao tiếp', 'Sáng tạo']
  },
  yaxis: {
    labels: {
      formatter: function(val) {
        return val + "%";
      }
    }
  }
};

/**
 * Workforce Growth Chart
 * Biểu đồ hiển thị chi tiết tăng trưởng nhân sự công ty theo tháng, bao gồm 
 * số lượng nhân viên mới, nhân viên nghỉ việc, tổng nhân sự và các chỉ số quan trọng
 */
const workforceGrowthChartOptions: ChartType = {
  series: [
    {
      name: "Tổng nhân sự",
      data: [70, 75, 80, 85, 92, 97, 105, 110, 120, 130, 140, 150]
    },
    {
      name: "Nhân sự mới",
      data: [10, 8, 10, 12, 15, 10, 14, 12, 17, 20, 15, 18]
    },
    {
      name: "Nghỉ việc",
      data: [5, 3, 5, 7, 8, 5, 6, 7, 7, 10, 5, 8]
    },
    {
      name: "Tỷ lệ giữ chân (%)",
      data: [92.8, 96.0, 93.7, 91.7, 91.3, 94.8, 94.2, 93.6, 94.1, 92.3, 96.4, 94.6],
      type: 'area'
    },
    {
      name: "Tỷ lệ tăng trưởng thực (%)",
      data: [7.1, 6.7, 6.3, 8.2, 5.4, 8.2, 4.8, 9.1, 8.3, 7.7, 7.1, 6.7],
      type: 'area'
    }
  ],
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: [3, 3, 3, 1, 1],
    dashArray: [0, 0, 0, 0, 0]
  },
  fill: {
    type: ['solid', 'solid', 'solid', 'gradient', 'gradient'],
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      inverseColors: true,
      opacityFrom: 0.8,
      opacityTo: 0.2
    }
  },
  markers: {
    size: 4,
    hover: {
      size: 6
    }
  },
  colors: ['#0acf97', '#727cf5', '#fa5c7c', '#39afd1', '#ffbc00'],
  xaxis: {
    categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    title: {
      text: 'Năm 2023'
    }
  },
  yaxis: {
    title: {
      text: 'Số lượng nhân viên'
    },
    min: 0,
    max: 160
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (y, { seriesIndex, dataPointIndex, w }) {
        if (typeof y !== "undefined") {
          const seriesName = w.config.series[seriesIndex].name;
          if (seriesName.includes("%")) {
            return y.toFixed(1) + "%";
          }
          return y.toFixed(0) + " nhân viên";
        }
        return y;
      }
    },
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const seriesName = w.config.series[seriesIndex].name;
      if (seriesName === "Tổng nhân sự") {
        const newEmployees = series[1][dataPointIndex];
        const leavers = series[2][dataPointIndex];
        const month = w.config.xaxis.categories[dataPointIndex];
        
        return `<div class="custom-tooltip">
          <span class="month">${month}/2023</span>
          <div class="details">
            <div class="total"><b>Tổng nhân sự:</b> ${series[0][dataPointIndex]} nhân viên</div>
            <div class="new"><b>Nhân sự mới:</b> ${newEmployees} nhân viên</div>
            <div class="leave"><b>Nghỉ việc:</b> ${leavers} nhân viên</div>
            <div class="net"><b>Tăng trưởng thuần:</b> ${newEmployees - leavers} nhân viên</div>
          </div>
        </div>`;
      }
      return undefined;
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
  },
  grid: {
    borderColor: '#f1f1f1'
  }
};

/**
 * Department Performance Chart
 * Biểu đồ hiển thị hiệu suất làm việc (thang điểm 100) của từng phòng ban
 * theo từng quý của năm hiện tại (2023).
 */
const departmentPerformanceChartOptions: ChartType = {
  series: [
    {
      name: 'IT',
      data: [92, 94, 89, 95]
    },
    {
      name: 'Marketing',
      data: [85, 82, 88, 90]
    },
    {
      name: 'Kinh doanh',
      data: [90, 92, 94, 91]
    },
    {
      name: 'Kế toán',
      data: [78, 80, 82, 83]
    },
    {
      name: 'Hành chính',
      data: [76, 75, 78, 80]
    }
  ],
  chart: {
    height: 350,
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function(val) {
      return val + '%';
    },
    style: {
      fontSize: '10px'
    }
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
    title: {
      text: 'Năm 2023'
    }
  },
  yaxis: {
    title: {
      text: 'Điểm hiệu suất (%)'
    },
    min: 0,
    max: 100
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function(val) {
        return val + '% hiệu suất';
      }
    }
  },
  colors: ['#556ee6', '#34c38f', '#f46a6a', '#50a5f1', '#f1b44c'],
  legend: {
    position: 'bottom',
    horizontalAlign: 'center'
  }
};

/**
 * Regional Distribution Chart
 * Biểu đồ này hiển thị phân bố nhân sự theo các vùng miền ở Việt Nam
 */
const regionDistributionChartOptions: ChartType = {
  series: [
    {
      data: [
        {
          x: 'Miền Bắc',
          y: 450
        },
        {
          x: 'Miền Trung',
          y: 230
        },
        {
          x: 'Miền Nam',
          y: 520
        },
        {
          x: 'Tây Nguyên',
          y: 110
        },
        {
          x: 'Đồng bằng sông Cửu Long',
          y: 190
        }
      ]
    }
  ],
  chart: {
    type: 'treemap',
    height: 350,
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '14px',
    },
    formatter: function(text, op) {
      return text + '\n' + op.value + ' nhân viên';
    },
    offsetY: -4
  },
  plotOptions: {
    treemap: {
      enableShades: true,
      shadeIntensity: 0.5,
      reverseNegativeShade: true,
      colorScale: {
        ranges: [
          {
            from: 0,
            to: 150,
            color: '#f1b44c'
          },
          {
            from: 151,
            to: 300,
            color: '#34c38f'
          },
          {
            from: 301,
            to: 600,
            color: '#556ee6'
          }
        ]
      }
    }
  },
  tooltip: {
    y: {
      formatter: function(value) {
        return value + ' nhân viên'
      }
    }
  }
};

/**
 * Thâm niên công tác
 * Biểu đồ hiển thị phân bố nhân viên theo thời gian làm việc tại công ty
 */
const seniorityChartOptions: ChartType = {
  series: [{
    name: 'Số lượng nhân viên',
    data: [85, 120, 180, 95, 45]
  }],
  chart: {
    height: 350,
    type: 'bar',
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      barHeight: '50%',
      dataLabels: {
        position: 'bottom'
      },
    }
  },
  colors: ['#f1b44c', '#50a5f1', '#556ee6', '#34c38f', '#f46a6a'],
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    style: {
      colors: ['#fff'],
      fontSize: '14px',
      fontWeight: 'bold'
    },
    formatter: function(val) {
      return val + ' nhân viên';
    },
    offsetX: 8
  },
  xaxis: {
    categories: ['Trên 10 năm', '5-10 năm', '3-5 năm', '1-3 năm', 'Dưới 1 năm'],
    labels: {
      style: {
        fontSize: '14px'
      }
    },
    title: {
      text: 'Số lượng nhân viên'
    }
  },
  yaxis: {
    title: {
      text: 'Thâm niên'
    }
  },
  tooltip: {
    y: {
      formatter: function(val) {
        return val + " nhân viên";
      }
    }
  },
  legend: {
    show: false
  }
};

/**
 * Helper function to generate heatmap data
 */
function generateHeatmapData(count, min, max) {
  let data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      x: i,
      y: Math.floor(Math.random() * (max - min + 1)) + min
    });
  }
  return data;
}

export {
  educationChartOptions,
  departmentChartOptions,
  genderRatioChartOptions,
  averageSalaryChartOptions,
  departmentGenderChartOptions,
  employeeSkillsChartOptions,
  workforceGrowthChartOptions,
  departmentPerformanceChartOptions,
  regionDistributionChartOptions,
  seniorityChartOptions
}; 