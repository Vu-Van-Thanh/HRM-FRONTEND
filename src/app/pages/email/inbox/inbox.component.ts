import { Component, OnInit } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Email } from './inbox.model';
import { emailData } from './data';
import Swal from 'sweetalert2';
import { EmailService, EmailDTO, MailStatus } from 'src/app/core/services/email.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})

/**
 * Email Inbox component
 */
export class InboxComponent implements OnInit {

  modalRef?: BsModalRef;

  public Editor = ClassicEditor;
  // bread crumb items
  breadCrumbItems: Array<{}>;

  // paginated email data
  emailData: Array<Email>;
  emailIds: string[] = [];
  emailDatas: any;
  // page number
  page: number = 1;
  // default page size
  pageSize: number = 15;
  // total number of records
  totalRecords: number = 0;

  // start and end index
  startIndex: number = 1;
  endIndex: number = 15;
  
  // API emails
  apiEmails: EmailDTO[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(
    private modalService: BsModalService,
    private emailService: EmailService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Email' }, { label: 'Inbox', active: true }];
    this.loadEmails();
  }
  
  /**
   * Map email status to category
   */
  mapStatusToCategory(status: MailStatus): string {
    switch (status) {
      case MailStatus.Received:
        return 'all';
      case MailStatus.Sent:
        return 'sent-mail';
      case MailStatus.Draft:
        return 'draft';
      case MailStatus.Deleted:
        return 'trash';
      default:
        return 'all';
    }
  }
  
  /**
   * Load emails from API
   */
  loadEmails() {
    this.isLoading = true;
    this.emailService.getAllEmailsByEmployee().subscribe({
      next: (emails) => {
        this.apiEmails = emails;
        this.totalRecords = emails.length;
        
        // Convert API emails to the format expected by the component
        this.emailData = this.apiEmails.map(email => ({
          id: email.emailId,
          subject: email.subject,
          title: email.sender,
          date: new Date(email.receivedAt).toLocaleString(),
          unread: !email.isRead,
          text: email.body,
          isStarred: email.isStarred,
          category: this.mapStatusToCategory(email.status)
        }));
        
        this.emailDatas = Object.assign([], this.emailData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching emails:', error);
        this.error = 'Failed to load emails';
        this.isLoading = false;
        
        // Fallback to demo data if API fails
        this.emailData = emailData;
        this.emailDatas = Object.assign([], this.emailData);
        this.totalRecords = emailData.length;
      }
    });
  }

  open(content) {
    this.modalRef = this.modalService.show(content);
  }

  markUnread() {
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.emailIds.length; i++) {
      const obj = this.emailData.find(o => o.id === this.emailIds[i]);
      const index = this.emailData.indexOf(obj);
      this.emailData[index].unread = true;
    }
    this.emailIds = [];
  }

  selectMail(event, id) {
    if (event.target.checked) {
      this.emailIds.push(id);
    } else {
      this.emailIds.splice(this.emailIds.indexOf(id), 1);
    }
  }

  deleteMail() {
    const found = this.emailData.some(r => this.emailIds.indexOf(r.id) >= 0);
    if (found) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.emailIds.length; i++) {
        const obj = this.emailData.find(o => o.id === this.emailIds[i]);
        this.emailData.splice(this.emailData.indexOf(obj), 1);
      }
    }
    this.emailIds = [];
  }

  confirm() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.value) {
        this.deleteMail();
        Swal.fire('Deleted!', 'Mail has been deleted.', 'success');
      }
    });
  }

  /**
   * Handle on page click event
   */
  onPageChange(page: any): void {
    this.startIndex = (page - 1) * this.pageSize + 1;
    this.endIndex = (page - 1) * this.pageSize + this.pageSize;
    if (this.endIndex > this.totalRecords) {
      this.endIndex = this.totalRecords;
    }
    this.emailData = this.emailDatas.slice(this.startIndex - 1, this.endIndex - 1);
  }

  /**
   * Category Filtering  
   */
  categoryFilter(e:any, name: any) {  
    var removeClass = document.querySelectorAll('.mail-list a');
    removeClass.forEach((element: any) => {      
        element.classList.remove('active');
    });
    e.target.closest('.mail-list a').classList.add('active')   
    if(name == 'all'){
      this.emailDatas = this.emailData
    } 
    else{
      this.emailDatas = this.emailData.filter((email:any) => {     
        return email.category === name;
      });
    } 
  }

}
