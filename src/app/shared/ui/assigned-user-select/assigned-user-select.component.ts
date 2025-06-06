import { Component, forwardRef, OnInit, Output, EventEmitter, Input,SimpleChanges  } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {Employee} from '../../../pages/employee/employee.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import {EmployeeService} from '../../../pages/employee/employee.service';
import { API_ENDPOINT } from 'src/app/core/constants/endpoint';

export interface User {
  employeeID: string;
  departmentID?: string;
  managerID?: string;
  position?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: string;
  tax: string;
  address?: string;
  nationality?: string; // default: "Việt Nam"
  ethnic?: string;
  religion?: string; // default: "Không"
  placeOfBirth?: string;
  indentityCard?: string;
  placeIssued?: string;
  country?: string;
  province?: string;
  district?: string;
  commune?: string;
  insuranceNumber?: string;
  avartar?: string;
}

export interface UserSelect {
  employeeID : string;
  fullname : string;
  avartar : string;
  indentityCard ?: string;
}
@Component({
  selector: 'app-assigned-user-select',
  templateUrl: './assigned-user-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AssignedUserSelectComponent),
      multi: true
    }
  ]
})
export class AssignedUserSelectComponent implements ControlValueAccessor, OnInit {

  constructor(private employeeService: EmployeeService, private http : HttpClient) { }
  employees : UserSelect[] = [];
  users = [
    { id: 1, name: 'Nguyễn Văn A' , email : 'anv@gmail.com'},
    { id: 2, name: 'Trần Thị B' ,  email : 'bnc@gmail.com'},
    { id: 3, name: 'Lê Văn C' , email : 'aws@gmail.com'}
  ];

  value: any;
  @Input() departmentId!: string;
  @Output() selectedChange = new EventEmitter<any>();

  onChange = (value: any) => {};
  onTouched = () => {};

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['departmentId'] && changes['departmentId'].currentValue) {
      const newDepartmentId = changes['departmentId'].currentValue;
      this.loadUsersByDepartment(newDepartmentId);
    }
  }

  loadUsersByDepartment(departmentId: string) {
    const body = {
      Department : departmentId,
      JobTitle : '',
      ManagerId : '',
      EmployeeId : ''
    }
    const params = new HttpParams({ fromObject: body });
    this.http.get<User[]>(API_ENDPOINT.getEmployeeByFilter2,{params}).subscribe((data) => {
      console.log(data);
      this.employees = this.mapResponseToUsers(data);
      console.log("Sau map", this.employees);
    });
  }
  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Optional: Implement nếu cần
  }

  mapResponseToUsers(response: User[]): UserSelect[] {
    return response.map(user => ({
      employeeID: user.employeeID,
      fullname: `${user.firstName} ${user.lastName}`,
      avartar: user.avartar || 'default-avatar.png', 
      indentityCard: user.indentityCard
    }));
  }

  onSelectChange(event: any) {
    this.value = event;
    this.onChange(event);
    this.selectedChange.emit(event);
  }
}
