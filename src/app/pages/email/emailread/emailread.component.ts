import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { Email } from '../inbox/inbox.model';
import { emailData } from '../inbox/data';
import { EmailService, EmailDTO, MailStatus } from 'src/app/core/services/email.service';

@Component({
  selector: 'app-emailread',
  templateUrl: './emailread.component.html',
  styleUrls: ['./emailread.component.scss']
})

/**
 * Email read Component
 */
export class EmailreadComponent implements OnInit {

  modalRef?: BsModalRef;

  public index: string;
  public Editor = ClassicEditor;
  // bread crumb items
  breadCrumbItems: Array<{}>;
  emailRead: Array<Email> | undefined;
  currentEmail: EmailDTO | null = null;
  safeHtmlBody: SafeHtml | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  // Enum MailStatus để sử dụng trong template
  mailStatus = MailStatus;

  constructor(
    private route: ActivatedRoute, 
    private modalService: BsModalService,
    private emailService: EmailService,
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe(params => {
      const emailId = params.id;
      this.index = emailId;

      // Initialize emailRead với giá trị mặc định để tránh lỗi undefined
      this.emailRead = [];

      const demoEmails = emailData.filter((email) => {
        return email.id === emailId;
      });
      
      if (demoEmails.length > 0) {
        this.emailRead = demoEmails;
      }
      this.loadEmailFromAPI(emailId);
    });
  }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Email' }, { label: 'Read Email', active: true }];
  }

  /**
   * Load email details from API
   * @param emailId The ID of the email to load
   */
  loadEmailFromAPI(emailId: string) {
    this.isLoading = true;
    this.emailService.getAllEmailsByEmployee().subscribe({
      next: (emails) => {
        const foundEmail = emails.find(email => email.emailId === emailId);
        if (foundEmail) {
          this.currentEmail = foundEmail;
          
          // Sanitize the HTML content for safe rendering
          this.safeHtmlBody = this.sanitizer.bypassSecurityTrustHtml(foundEmail.body);
          
          // Chuyển đổi thành dạng Email model cho component
          // Kiểm tra nếu emailRead chưa được khởi tạo
          if (!this.emailRead) {
            this.emailRead = [];
          }
          
          // Tạo đối tượng Email mới từ dữ liệu EmailDTO
          const emailModel: Email = {
            id: foundEmail.emailId,
            title: foundEmail.sender,
            subject: foundEmail.subject,
            text: foundEmail.body,
            date: new Date(foundEmail.receivedAt).toLocaleString(),
            unread: !foundEmail.isRead,
            isStarred: foundEmail.isStarred,
            category: this.mapStatusToCategory(foundEmail.status)
          };
          
          // Thay thế emailRead[0] hoặc thêm mới
          if (this.emailRead.length > 0) {
            this.emailRead[0] = emailModel;
          } else {
            this.emailRead.push(emailModel);
          }
        } else {
          // Không tìm thấy email trong API
          console.log('Email not found in API data');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching email details:', error);
        this.error = 'Failed to load email details';
        this.isLoading = false;
      }
    });
  }

  /**
   * Chuyển đổi từ MailStatus sang category string
   */
  mapStatusToCategory(status: MailStatus): string {
    switch (status) {
      case MailStatus.Received:
        return 'inbox';
      case MailStatus.Sent:
        return 'sent-mail';
      case MailStatus.Draft:
        return 'draft';
      case MailStatus.Deleted:
        return 'trash';
      default:
        return 'inbox';
    }
  }

  open(content) {
    this.modalRef = this.modalService.show(content);
  }
}
