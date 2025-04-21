import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Contract {
  contractNumber: string;
  type: string;
  position: string;
  department: string;
  startDate: Date;
  endDate: Date;
  salary: number;
  status: string;
  documentUrl: string;
  workingTime?: string;
}

interface NewContract {
  contractType: string;
  position: string;
  startDate: Date;
  endDate: Date;
  salary: number;
  workingTime: string;
}

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss']
})
export class ContractComponent implements OnInit {
  contracts: Contract[] = [];
  selectedContract: Contract | null = null;
  showPreview = false;
  previewUrl: SafeResourceUrl | null = null;
  
  // Thêm các thuộc tính mới
  newContract: NewContract = {
    contractType: '',
    position: '',
    startDate: new Date(),
    endDate: new Date(),
    salary: 0,
    workingTime: ''
  };
  
  contractTypes: string[] = [
    'Hợp đồng chính thức',
    'Hợp đồng thử việc',
    'Hợp đồng thời vụ',
    'Hợp đồng cộng tác viên'
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    // Mock data - replace with actual API call
    this.contracts = [
      {
        contractNumber: 'HD001',
        type: 'Hợp đồng chính thức',
        position: 'Nhân viên phát triển',
        department: 'Phòng IT',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-01-01'),
        salary: 15000000,
        status: 'Active',
        documentUrl: 'https://example.com/contracts/HD001.docx',
        workingTime: '8 giờ/ngày'
      },
      {
        contractNumber: 'HD002',
        type: 'Hợp đồng thử việc',
        position: 'Nhân viên phát triển',
        department: 'Phòng IT',
        startDate: new Date('2022-10-01'),
        endDate: new Date('2022-12-31'),
        salary: 12000000,
        status: 'Expired',
        documentUrl: 'https://example.com/contracts/HD002.docx',
        workingTime: '8 giờ/ngày'
      }
    ];
  }

  viewContract(contract: Contract): void {
    this.selectedContract = contract;
    // Generate preview URL using Microsoft Office Online Viewer
    const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(contract.documentUrl)}`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewUrl = null;
    this.selectedContract = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Expired':
        return 'bg-danger';
      case 'Draft':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }
  
  // Thêm phương thức mới
  addContract(): void {
    if (!this.newContract.contractType || !this.newContract.position || 
        !this.newContract.startDate || !this.newContract.salary || 
        !this.newContract.workingTime) {
      return;
    }
    
    // Tạo hợp đồng mới
    const newContract: Contract = {
      contractNumber: `HD${this.contracts.length + 1}`.padStart(3, '0'),
      type: this.newContract.contractType,
      position: this.newContract.position,
      department: 'Phòng IT', // Giả sử mặc định là Phòng IT
      startDate: this.newContract.startDate,
      endDate: this.newContract.endDate || new Date(this.newContract.startDate.getFullYear() + 1, this.newContract.startDate.getMonth(), this.newContract.startDate.getDate()),
      salary: this.newContract.salary,
      status: 'Active',
      documentUrl: `https://example.com/contracts/HD${this.contracts.length + 1}`.padStart(3, '0') + '.docx',
      workingTime: this.newContract.workingTime
    };
    
    // Thêm vào danh sách
    this.contracts.push(newContract);
    
    // Reset form
    this.resetForm();
  }
  
  resetForm(): void {
    this.newContract = {
      contractType: '',
      position: '',
      startDate: new Date(),
      endDate: new Date(),
      salary: 0,
      workingTime: ''
    };
  }
} 