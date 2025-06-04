import { Component, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
  selector: 'app-createtask',
  templateUrl: './createtask.component.html',
  styleUrls: ['./createtask.component.scss']
})

/**
 * Tasks-create component
 */
export class CreatetaskComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;

  // data
  Title : string;
  Description : string;
  StartDate : Date;
  EndDate : Date;
  Priority : string;
  Status : string;
  ProjectId : string;
  AssignedTo : string;
  Attachments : File[] = [];

  public Editor = ClassicEditor;
  bsConfig = {
  dateInputFormat: 'DD/MM/YYYY',
  containerClass: 'theme-default',
  showWeekNumbers: false
};


  form = new UntypedFormGroup({
    member: new UntypedFormArray([
      new UntypedFormControl(''),
    ]),
  });

  hidden: boolean;
  selected: any;

  @Input() fromDate: Date;
  @Input() toDate: Date;
  @Output() dateRangeSelected: EventEmitter<{}> = new EventEmitter();

  @ViewChild('dp', { static: true }) datePicker: any;

  /**
   * Returns the form field value
   */
  get member(): UntypedFormArray { return this.form.get('member') as UntypedFormArray; }

  /**
   * Add the member field in form
   */
  addMember() {
    this.member.push(new UntypedFormControl());
  }

  /**
   * Onclick delete member from form
   */
  deleteMember(i: number) {
    this.member.removeAt(i);
  }

  constructor() { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Create Task', active: true }];

    this.hidden = true;
  }
  onFileChange(event: any): void {
  const selectedFiles: FileList = event.target.files;
  if (selectedFiles) {
    for (let i = 0; i < selectedFiles.length; i++) {
      this.Attachments.push(selectedFiles.item(i)!);
    }
  }
}

removeAttachment(index: number): void {
  this.Attachments.splice(index, 1);
}
}
