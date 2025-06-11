import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-attachment-modal',
  templateUrl: './attachment-modal.component.html'
})
export class AttachmentModalComponent {
  @Input() attachments: string[] = []; // Nhận danh sách attachments từ parent component

  constructor(public modalRef: BsModalRef, private sanitizer: DomSanitizer) {}

  // Xác định loại tệp dựa trên phần mở rộng
  getFileType(file: string): string {
    const extension = file.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return 'video';
    } else {
      return 'other';
    }
  }

  // Lấy biểu tượng FontAwesome dựa trên loại tệp
  getFileIcon(file: string): string {
    const extension = file.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fas fa-file-excel';
      case 'ppt':
      case 'pptx':
        return 'fas fa-file-powerpoint';
      default:
        return 'fas fa-file';
    }
  }

  // Lấy tên tệp từ URL
  getFileName(file: string): string {
    return file.split('/').pop() || file;
  }

  // An toàn hóa URL cho iframe
  safeUrl(file: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(file);
  }
}