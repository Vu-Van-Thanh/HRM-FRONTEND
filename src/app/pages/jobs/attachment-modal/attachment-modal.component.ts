import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-attachment-modal',
  templateUrl: './attachment-modal.component.html'
})
export class AttachmentModalComponent {
  attachments: string[] = [];
  constructor(public modalRef: BsModalRef) {}
}
