import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ChartType, GrowthWorkforce,EmployeeCounter, EmployeeInDepartment, DepartmentPerformance } from './hr-statistics.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexGrid, ApexLegend, ApexMarkers, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ApexResponsive } from "ng-apexcharts";
import * as L from 'leaflet';
import { Observable } from 'rxjs';
import { ChartComponent } from "ng-apexcharts";

import {
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
} from './data';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

interface RegionData {
  name: string;
  center: [number, number]; // LatLngTuple
  employees: number;
  color: string;
}

@Component({
  selector: 'app-hr-statistics',
  templateUrl: './hr-statistics.component.html',
  styleUrls: ['./hr-statistics.component.scss']
})
export class HrStatisticsComponent implements OnInit, AfterViewInit {

  @ViewChild("departmentGenderChart") departmentGenderChart: ChartComponent;

  // Chart variables
  educationChartOptions: ChartType;
  departmentChartOptions: ChartType;
  genderRatioChartOptions: ChartType;
  averageSalaryChartOptions: ChartType;
  departmentGenderChartOptions: ChartType;
  employeeSkillsChartOptions: ChartType;
  workforceGrowthChartOptions: ChartType;
  departmentPerformanceChartOptions: ChartType;
  regionDistributionChartOptions: ChartType;
  seniorityChartOptions: ChartType;

  // Map variables
  private map: L.Map;
  // Tọa độ giới hạn của Việt Nam
  private vietnamBounds: L.LatLngBoundsLiteral = [
    [8.18, 102.14], // Tọa độ phía tây nam Việt Nam
    [23.39, 109.47]  // Tọa độ phía đông bắc Việt Nam
  ];
  
  regionData: RegionData[] = [
    { name: 'Miền Bắc', center: [21.0285, 105.8542], employees: 450, color: '#556ee6' },
    { name: 'Miền Trung', center: [16.0544, 108.2022], employees: 230, color: '#34c38f' },
    { name: 'Miền Nam', center: [10.8231, 106.6297], employees: 520, color: '#f46a6a' },
    { name: 'Tây Nguyên', center: [12.6663, 108.0479], employees: 110, color: '#f1b44c' },
    { name: 'Đồng bằng sông Cửu Long', center: [9.7975, 105.6235], employees: 190, color: '#50a5f1' }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this._fetchData();
  }

  ngAfterViewInit(): void {
    // Đợi 1 giây để DOM render xong
    setTimeout(() => {
      this.initMap();
    }, 1000);
  }

  /**
   * Fetches the chart data
   */
  private _fetchData() {
    this.educationChartOptions = educationChartOptions;
    this.departmentChartOptions = departmentChartOptions;
    this.genderRatioChartOptions = genderRatioChartOptions;
    this.averageSalaryChartOptions = averageSalaryChartOptions;
    this.departmentGenderChartOptions = departmentGenderChartOptions;
    this.employeeSkillsChartOptions = employeeSkillsChartOptions;
    this.workforceGrowthChartOptions = workforceGrowthChartOptions;
    this.departmentPerformanceChartOptions = departmentPerformanceChartOptions;
    this.regionDistributionChartOptions = regionDistributionChartOptions;
    this.seniorityChartOptions = seniorityChartOptions;
  }

  private initMap(): void {
    const mapElement = document.getElementById('region-map');
    if (!mapElement) return;

    // Tạo map với tọa độ trung tâm của Việt Nam
    this.map = L.map('region-map', {
      center: [16.0544, 107.7045], // Trung tâm Việt Nam
      zoom: 5.5,
      zoomControl: false,
      // Loại bỏ maxBounds để cho phép di chuyển tự do
      minZoom: 3, // Giảm giới hạn zoom out để xem thêm vùng lân cận
      maxZoom: 18   // Tăng giới hạn zoom in để xem chi tiết
      // Loại bỏ maxBoundsViscosity để không còn giới hạn
    });

    // Thêm base layer từ OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Thêm các circle đại diện cho các vùng
    this.regionData.forEach(region => {
      // Tính bán kính dựa trên số lượng nhân viên (nhân viên càng nhiều thì bán kính càng lớn)
      const radius = Math.sqrt(region.employees) * 1500;
      
      // Tạo một circle marker
      const circle = L.circle(region.center, {
        color: region.color,
        fillColor: region.color,
        fillOpacity: 0.7,
        radius: radius
      }).addTo(this.map);

      // Thêm popup với thông tin chi tiết
      circle.bindPopup(`
        <div class="region-popup">
          <strong>${region.name}</strong><br>
          <span>Số nhân viên: ${region.employees}</span>
        </div>
      `);
      
      // Hiện tooltip khi hover
      circle.bindTooltip(`${region.name}: ${region.employees} nhân viên`);
    });

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);
    
    this.map.fitBounds(this.vietnamBounds);
  }

  updateworkforceGrowthChart() {
    this.http.get<GrowthWorkforce>(API_ENDPOINT.getGrowthWorkforce).subscribe(data => {
      console.log(data);
      
      if (data) {
        (this.workforceGrowthChartOptions.series as ApexAxisChartSeries).find(s => s.name === "Tổng nhân sự").data = data.employeeGrowthByMonth;
        (this.workforceGrowthChartOptions.series as ApexAxisChartSeries).find(s => s.name === "Nhân viên mới").data = data.newEmployeesByMonth;
        (this.workforceGrowthChartOptions.series as ApexAxisChartSeries).find(s => s.name === "Nhân viên nghỉ việc").data = data.leaveEmployeesByMonth;
        (this.workforceGrowthChartOptions.series as ApexAxisChartSeries).find(s => s.name === "Tỷ lệ giữ chân").data = data.retentionRate;
        (this.workforceGrowthChartOptions.series as ApexAxisChartSeries).find(s => s.name === "Tỷ lệ tăng trưởng").data = data.GrowthRate;
      } else {
        console.error("Không tìm thấy series 'Tổng nhân sự'");
      }
    });
  }
  
  updateEmployeeCountChart(){
    this.http.get<EmployeeCounter>(API_ENDPOINT.getEmployeeTotal).subscribe(data => {
      console.log(data);
        let employeeByGender = data.employeeGender;
        let employeeByDepartment = data.employeeDepartment;
        let employeeByDepartmentGender = data.employeeByDepartmentAndGender;
        let employeeByDegree = data.employeeByDegree;
        let employeeByRegion = data.employeeByRegion;
        let seniorityEmployees = data.seniorityEmployees;
        // xử lý gender chart 
        this.genderRatioChartOptions.series = [employeeByGender.male, employeeByGender.female];

        // xử lý department chart
        let total = employeeByDepartment.reduce((sum, d) => sum + d.employeeCount, 0);
        let colors = employeeByDepartment.map(() => this.generateRandomColor());
        let departmentLabels = data.employeeDepartment.map(d => d.departmentName);
        let departmentSeries = data.employeeDepartment.map(d => (d.employeeCount/total) * 100);
        this.departmentChartOptions.labels = departmentLabels;  
        this.departmentChartOptions.series = departmentSeries;
        this.departmentChartOptions.colors = colors;


        // xử lý dữ liệu nhân viên theo giới tính mỗi phòng ban
        let departmentGenderLabels = employeeByDepartmentGender.map(d => d.departmentName);
       
        let departmentGenderMale = employeeByDepartmentGender.map(d => d.male);
        let departmentGenderFemale = employeeByDepartmentGender.map(d => d.female);
        
        // Cập nhật categories cho biểu đồ
        if (this.departmentGenderChartOptions && this.departmentGenderChartOptions.xaxis) {
          this.departmentGenderChartOptions.xaxis.categories = departmentGenderLabels;
          
        } else {
          console.error("departmentGenderChartOptions.xaxis is undefined");
        }
        
        // Cập nhật dữ liệu series
        if (this.departmentGenderChartOptions && this.departmentGenderChartOptions.series) {
          (this.departmentGenderChartOptions.series as ApexAxisChartSeries)[0].data = departmentGenderMale;
          (this.departmentGenderChartOptions.series as ApexAxisChartSeries)[1].data = departmentGenderFemale;
        }
        
        this.updateDepartmentGenderChart();
        
        // xử lý dữ liệu nhân viên theo trình độ học vấn
        let employeeByDegreeLabels = employeeByDegree.map(d => d.degreeName);
        let employeeByDegreeCount = employeeByDegree.map(d => d.employeeCount);
        let colorsDegree = employeeByDegree.map(() => this.generateRandomColor());
        this.educationChartOptions.labels = employeeByDegreeLabels;
        this.educationChartOptions.series = employeeByDegreeCount;
        this.educationChartOptions.colors = colorsDegree;
        // xử lý dữ liệu nhân viên theo khu vực
        if (employeeByRegion && employeeByRegion.length > 0) {
          console.log("Updating region distribution chart with:", employeeByRegion);
          // Format data for treemap chart
          this.regionDistributionChartOptions.series = [
            {
              data: employeeByRegion.map(region => ({
                x: region.regionName,
                y: region.employeeCount
              }))
            }
          ];
          console.log("Updated regionDistributionChartOptions.series:", this.regionDistributionChartOptions.series);
        }
        // xử xử lý dữ liệu thâm niêm làm việc
        let seniorityLabels = seniorityEmployees.map(s => s.type);
        let seniorityCount = seniorityEmployees.map(s => s.count);
        this.seniorityChartOptions.xaxis.categories = seniorityLabels;
        (this.seniorityChartOptions.series as ApexAxisChartSeries)[0].data = seniorityCount;
    });

    this.updateworkforceGrowthChart();
    this.UpdatePerformanceChart();
  }

  /**
   * Cập nhật lại biểu đồ departmentGenderChart
   */
  updateDepartmentGenderChart() {
    
    setTimeout(() => {
      if (this.departmentGenderChart && this.departmentGenderChart.updateOptions) {
       
        this.departmentGenderChart.updateOptions({
          xaxis: {
            categories: this.departmentGenderChartOptions.xaxis.categories
          },
          series: this.departmentGenderChartOptions.series
        }, true, true);
      } else {
        console.log("Không thể cập nhật biểu đồ - departmentGenderChart chưa được khởi tạo");
      }
    });
  }

  getEmployeeInDepartment() : Observable<EmployeeInDepartment> {
    return this.http.get<EmployeeInDepartment>(API_ENDPOINT.getEmployeeInDepartment);
  }

  UpdatePerformanceChart(){
    // Get data from first API
    this.getEmployeeInDepartment().subscribe(employeeData => {
      console.log('Employee department data:', employeeData);
      
      // Prepare data for performance API as query parameters
      // We need to create an HttpParams object for proper array parameter handling
      let params = new HttpParams();
      
      // Add the department IDs and employee IDs
      // For .NET Core Web API, arrays are passed as repeated parameters
      if (employeeData.departmentID && employeeData.employeeIDList) {
        for (let i = 0; i < employeeData.departmentID.length; i++) {
          params = params.append('DepartmentID', employeeData.departmentID[i]);
          
          // Only add the corresponding employee ID if it exists
          if (i < employeeData.employeeIDList.length) {
            params = params.append('employeeIDList', employeeData.employeeIDList[i]);
          }
        }
      }
      
      console.log(params);
      // Call the performance API with the department data as query params
      this.http.get<DepartmentPerformance[]>(
        API_ENDPOINT.getDepartmentPerfomance, 
        { params: params }
      ).subscribe(performanceData => {
        console.log('Department performance data:', performanceData);
        
        if (performanceData && performanceData.length > 0) {
          // Process performance data
          const departmentNames = performanceData.map(item => item.departmentName);
          
          // Handle the performanceScore as an array
          // Approach 1: Use all data points in a multi-series chart - each department gets its own series
          const seriesData = performanceData.map(item => ({
            name: item.departmentName,
            data: item.performanceScore
          }));
          
          // Update the chart options for multi-series data
          this.departmentPerformanceChartOptions.xaxis.categories = 
            Array.from({ length: Math.max(...performanceData.map(d => d.performanceScore.length)) }, (_, i) => `Q${i+1}`);
          this.departmentPerformanceChartOptions.series = seriesData;
        }
      });
    });
  }
 



  

  generateRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }
  
} 