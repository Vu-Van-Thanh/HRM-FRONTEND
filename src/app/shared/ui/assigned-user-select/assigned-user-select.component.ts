import {
  Component,
  forwardRef,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

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
  users = [
    { id: 1, name: 'Nguyễn Văn A' , email : 'anv@gmail.com'},
    { id: 2, name: 'Trần Thị B' ,  email : 'bnc@gmail.com'},
    { id: 3, name: 'Lê Văn C' , email : 'aws@gmail.com'}
  ];

  value: any;
  @Output() selectedChange = new EventEmitter<any>();

  onChange = (value: any) => {};
  onTouched = () => {};

  ngOnInit(): void {}

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

  onSelectChange(event: any) {
    this.value = event;
    this.onChange(event);
    this.selectedChange.emit(event);
  }
}
