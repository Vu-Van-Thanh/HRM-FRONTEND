import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChartType } from './hr-statistics.model';
import * as L from 'leaflet';

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

  constructor() { }

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
      maxBounds: L.latLngBounds(this.vietnamBounds),
      minZoom: 5.5, // Giới hạn zoom out
      maxZoom: 9,   // Giới hạn zoom in
      maxBoundsViscosity: 1.0 // Ngăn kéo ra ngoài biên giới hoàn toàn
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

    // Thêm control zoom ở góc phải dưới
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);
    
    // Fit bounds để vừa khít Việt Nam
    this.map.fitBounds(this.vietnamBounds);
  }
} 