import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Contract {
  employeeId?: string;
  contractNumber: string;
  contractType: string;
  type?: string;
  position: string;
  department?: string;
  startDate: Date;
  endDate: Date;
  salary?: number;
  salaryIndex?: number;
  salaryBase?: number;
  status: string;
  documentUrl?: string;
  contractUrl?: string;
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
  isLoading = false;
  isSubmitting = false;
  contractFile: File | null = null;
  isLoadingPreview = false;
  viewerMessage: string = '';
  viewerMessageType: string = '';
  
  // Define API endpoints
  private apiEndpoints = API_ENDPOINT;
  
  // Contract form
  contractForm: FormGroup;
  
  contractTypes: string[] = [
    'Full-time',
    'Part-time',
    'Probation',
    'Internship',
    'Temporary'
  ];

  statusOptions: string[] = [
    'Active',
    'Draft',
    'Expired'
  ];

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // Get today's date and tomorrow's date for form defaults
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    this.contractForm = this.fb.group({
      contractNumber: ['', Validators.required],
      contractType: ['Full-time', Validators.required],
      position: ['', Validators.required],
      startDate: [today.toISOString().split('T')[0], Validators.required],
      endDate: [nextYear.toISOString().split('T')[0]],
      salaryBase: [0, [Validators.required, Validators.min(0)]],
      salaryIndex: [1.0, [Validators.required, Validators.min(0)]],
      status: ['Active', Validators.required],
      contractFile: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.isLoading = true;
    
    // Get employeeID from localStorage
    const userProfileString = localStorage.getItem('currentUserProfile');
    if (userProfileString) {
      const userProfile = JSON.parse(userProfileString);
      const employeeId = userProfile.employeeID;
      
      if (employeeId) {
        const url = this.apiEndpoints.getContractByEmployeeId.replace('{employeeId}', employeeId);
        
        this.http.get<any>(url).subscribe({
          next: (response) => {
            console.log('Contracts response:', response);
            if (response && Array.isArray(response) && response.length > 0) {
              this.contracts = response.map(contract => this.mapContractResponse(contract));
            } else if (response && typeof response === 'object' && response.data && Array.isArray(response.data) && response.data.length > 0) {
              // Handle if response is wrapped in a data property
              this.contracts = response.data.map(contract => this.mapContractResponse(contract));
            } else {
              console.log('No contracts found or empty response');
              this.contracts = [];
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching contracts:', error);
            this.isLoading = false;
            // Fallback to mock data for development
            this.loadMockContracts();
          }
        });
      } else {
        console.error('No employee ID found in user profile');
        this.isLoading = false;
        this.loadMockContracts();
      }
    } else {
      console.error('No user profile found in localStorage');
      this.isLoading = false;
      this.loadMockContracts();
    }
  }
  
  // Map API response to Contract interface
  mapContractResponse(contract: any): Contract {
    return {
      employeeId: contract.employeeId,
      contractNumber: contract.contractNumber || '',
      contractType: contract.contractType || '',
      type: contract.contractType || '',
      position: contract.position || '',
      startDate: new Date(contract.startDate),
      endDate: new Date(contract.endDate),
      salaryIndex: contract.salaryIndex,
      salaryBase: contract.salaryBase,
      salary: contract.salaryBase ? contract.salaryBase * (contract.salaryIndex || 1) : 0,
      status: contract.status || 'Unknown',
      contractUrl: contract.contractUrl,
      department: ''  // Add department info if available in the response
    };
  }
  
  // Fallback to mock data for development
  loadMockContracts(): void {
    this.contracts = [
      {
        contractNumber: 'CT0001',
        type: 'Full-time',
        contractType: 'Full-time',
        position: 'Software Engineer',
        department: 'IT',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2025-01-01'),
        salaryIndex: 1.5,
        salaryBase: 50000,
        salary: 75000,
        status: 'Active',
        documentUrl: 'https://example.com/contracts/HD001.docx',
        workingTime: '8 giờ/ngày'
      },
      {
        contractNumber: 'CT0002',
        type: 'Probation',
        contractType: 'Probation',
        position: 'Software Engineer',
        department: 'IT',
        startDate: new Date('2022-10-01'),
        endDate: new Date('2022-12-31'),
        salaryIndex: 1.0,
        salaryBase: 40000,
        salary: 40000,
        status: 'Expired',
        documentUrl: 'https://example.com/contracts/HD002.docx',
        workingTime: '8 giờ/ngày'
      }
    ];
  }

  viewContract(contract: Contract): void {
    this.selectedContract = contract;
    
    // Check if contract has URL
    if (contract.contractUrl) {
      let fileUrl = contract.contractUrl;
      
      // If not an absolute URL, add the base URL (adjust this according to your API)
      if (fileUrl && !fileUrl.startsWith('http')) {
        // Assuming the API returns a relative path
        if (!fileUrl.startsWith('/')) {
          fileUrl = '/' + fileUrl;
        }
        fileUrl = `https://localhost:7214${fileUrl}`;
      }
      
      console.log("File URL:", fileUrl);
      
      // Kiểm tra loại file để quyết định cách hiển thị
      const fileExtension = this.getFileExtension(fileUrl).toLowerCase();
      console.log("File extension:", fileExtension);
      
      // Hiển thị menu lựa chọn cách xem file
      const viewOptions = [
        'Sử dụng Microsoft Office Online Viewer',
        'Sử dụng Google Docs Viewer',
        'Tải file về máy',
        'Mở trong tab mới'
      ];
      
      const viewOption = confirm(
        'Chọn "OK" để xem online, "Cancel" để tải về'
      );
      
      if (viewOption) {
        // Người dùng chọn xem online
        try {
          this.isLoadingPreview = true;
          this.viewerMessage = '';
          // Thử sử dụng Microsoft Office Online Viewer
          const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
          console.log("Preview URL:", previewUrl);
          
          this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
          this.showPreview = true;
          
          // Thêm nút để chuyển sang Google Docs Viewer nếu Microsoft không hoạt động
          setTimeout(() => {
            const useGoogleViewer = confirm(
              'Nếu không xem được file qua Microsoft Office Online, bạn có muốn thử xem bằng Google Docs Viewer không?'
            );
            
            if (useGoogleViewer) {
              const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
              this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsUrl);
            }
          }, 5000); // Chờ 5 giây để người dùng thấy kết quả từ Microsoft trước
        } catch (error) {
          console.error('Error setting up preview:', error);
          this.viewerMessage = 'Không thể thiết lập xem trực tuyến. Vui lòng tải file về.';
          this.viewerMessageType = 'text-danger';
          this.isLoadingPreview = false;
          alert('Không thể thiết lập xem trực tuyến. Vui lòng tải file về.');
          window.open(fileUrl, '_blank');
        }
      } else {
        // Người dùng chọn tải file về
        window.open(fileUrl, '_blank');
      }
    } else {
      this.viewerMessage = 'Không tìm thấy file hợp đồng';
      this.viewerMessageType = 'text-danger';
      alert('Không tìm thấy file hợp đồng');
    }
  }

  // Switch viewer between Microsoft and Google
  switchViewer(viewerType: string): void {
    if (!this.selectedContract || !this.selectedContract.contractUrl) {
      this.viewerMessage = 'Không có file để hiển thị';
      this.viewerMessageType = 'text-danger';
      return;
    }

    this.isLoadingPreview = true;
    let fileUrl = this.selectedContract.contractUrl;
    
    // If not an absolute URL, add the base URL
    if (fileUrl && !fileUrl.startsWith('http')) {
      if (!fileUrl.startsWith('/')) {
        fileUrl = '/' + fileUrl;
      }
      fileUrl = `https://localhost:7214${fileUrl}`;
    }
    
    if (viewerType === 'microsoft') {
      this.viewerMessage = 'Đang sử dụng Microsoft Office Online Viewer';
      this.viewerMessageType = 'text-info';
      const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewUrl);
    } else if (viewerType === 'google') {
      this.viewerMessage = 'Đang sử dụng Google Docs Viewer';
      this.viewerMessageType = 'text-success';
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsUrl);
    }
  }

  // Download the contract file
  downloadFile(): void {
    if (!this.selectedContract || !this.selectedContract.contractUrl) {
      this.viewerMessage = 'Không có file để tải về';
      this.viewerMessageType = 'text-danger';
      return;
    }
    
    let fileUrl = this.selectedContract.contractUrl;
    
    // If not an absolute URL, add the base URL
    if (fileUrl && !fileUrl.startsWith('http')) {
      if (!fileUrl.startsWith('/')) {
        fileUrl = '/' + fileUrl;
      }
      fileUrl = `https://localhost:7214${fileUrl}`;
    }
    
    window.open(fileUrl, '_blank');
    this.viewerMessage = 'Đã mở file để tải xuống';
    this.viewerMessageType = 'text-success';
  }

  // Handle iframe load event
  onIframeLoad(): void {
    this.isLoadingPreview = false;
    this.viewerMessage = 'Tài liệu đã được tải thành công';
    this.viewerMessageType = 'text-success';
  }

  // Handle iframe error event
  onIframeError(): void {
    this.isLoadingPreview = false;
    this.viewerMessage = 'Không thể tải tài liệu. Vui lòng thử cách xem khác';
    this.viewerMessageType = 'text-danger';
  }

  // Hàm lấy phần mở rộng của file từ URL
  getFileExtension(url: string): string {
    if (!url) return '';
    
    // Xử lý URL có query parameters
    const baseUrl = url.split('?')[0];
    const parts = baseUrl.split('.');
    
    if (parts.length === 1) return ''; // Không có phần mở rộng
    
    return parts[parts.length - 1];
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewUrl = null;
    this.selectedContract = null;
    this.viewerMessage = '';
    this.isLoadingPreview = false;
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
  
  // Calculate total salary
  calculateTotalSalary(contract: Contract): number {
    if (contract.salaryBase && contract.salaryIndex) {
      return contract.salaryBase * contract.salaryIndex;
    }
    return contract.salary || 0;
  }

  // Handle file input change
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.contractFile = input.files[0];
      this.contractForm.patchValue({
        contractFile: this.contractFile
      });
    }
  }
  
  // Submit the form to add a new contract
  addContract(): void {
    console.log('Form values:', this.contractForm.value);
    
    if (this.contractForm.invalid || !this.contractFile) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.contractForm.controls).forEach(key => {
        const control = this.contractForm.get(key);
        control?.markAsTouched();
      });
      console.log('Form is invalid:', this.contractForm.errors);
      return;
    }

    this.isSubmitting = true;
    
    // Get employeeID from localStorage
    const userProfileString = localStorage.getItem('currentUserProfile');
    if (userProfileString) {
      const userProfile = JSON.parse(userProfileString);
      const employeeId = userProfile.employeeID;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('employeeId', employeeId);
      formData.append('contractNumber', this.contractForm.value.contractNumber);
      formData.append('contractType', this.contractForm.value.contractType);
      
      // Handle startDate - convert string to Date if needed
      const startDate = this.contractForm.value.startDate;
      if (startDate) {
        const startDateValue = typeof startDate === 'string' 
          ? new Date(startDate).toISOString() 
          : new Date(startDate).toISOString();
        formData.append('startDate', startDateValue);
        console.log('Start date:', startDateValue);
      }
      
      // Handle endDate - convert string to Date if needed
      const endDate = this.contractForm.value.endDate;
      if (endDate) {
        const endDateValue = typeof endDate === 'string' 
          ? new Date(endDate).toISOString() 
          : new Date(endDate).toISOString();
        formData.append('endDate', endDateValue);
        console.log('End date:', endDateValue);
      }
      
      formData.append('salaryIndex', this.contractForm.value.salaryIndex.toString());
      formData.append('salaryBase', this.contractForm.value.salaryBase.toString());
      formData.append('position', this.contractForm.value.position);
      formData.append('status', this.contractForm.value.status);
      formData.append('contractFile', this.contractFile);
      
      // Log all form data entries for debugging
      console.log("Form data entries:");
      formData.forEach((value, key) => {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      });
      
      // Make API call to create contract
      this.http.post(this.apiEndpoints.createContract, formData, { observe: 'response' })
        .subscribe({
          next: (response) => {
            console.log('Contract created successfully:', response);
            this.isSubmitting = false;
            this.resetForm();
            alert('Thêm hợp đồng thành công!');
            // Reload contracts
            this.loadContracts();
          },
          error: (error) => {
            // Kiểm tra nếu status là 200 thì vẫn coi là thành công
            if (error.status === 200) {
              console.log('Contract created successfully despite error object:', error);
              this.isSubmitting = false;
              this.resetForm();
              alert('Thêm hợp đồng thành công!');
              // Reload contracts
              this.loadContracts();
              return;
            }
            
            console.error('Error creating contract:', error);
            this.isSubmitting = false;
            alert('Lỗi khi thêm hợp đồng. Vui lòng thử lại.');
          }
        });
    } else {
      this.isSubmitting = false;
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
    }
  }
  
  resetForm(): void {
    // Get today's date and tomorrow's date for form defaults
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    this.contractForm.reset({
      contractNumber: '',
      contractType: 'Full-time',
      position: '',
      startDate: today.toISOString().split('T')[0],
      endDate: nextYear.toISOString().split('T')[0],
      salaryBase: 0,
      salaryIndex: 1.0,
      status: 'Active'
    });
    this.contractFile = null;
  }
} 