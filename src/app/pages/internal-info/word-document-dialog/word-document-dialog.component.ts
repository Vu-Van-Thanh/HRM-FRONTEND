import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InternalInfoService } from '../services/internal-info.service';
import { InternalInfo } from '../models/internal-info.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-word-document-dialog',
  templateUrl: './word-document-dialog.component.html',
  styleUrls: ['./word-document-dialog.component.scss']
})
export class WordDocumentDialogComponent implements OnInit {
  htmlContent: string = '';
  safeHtmlContent: SafeHtml;
  loading: boolean = true;
  error: string = '';
  isPreview: boolean = false;
  
  constructor(
    public dialogRef: MatDialogRef<WordDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      info: InternalInfo, 
      isContentPreview?: boolean,
      htmlContent?: string 
    },
    private internalInfoService: InternalInfoService,
    private sanitizer: DomSanitizer
  ) { }
  
  ngOnInit(): void {
    this.isPreview = this.data.isContentPreview || false;
    
    if (this.isPreview && this.data.htmlContent) {
      // If it's a preview with provided HTML content
      this.htmlContent = this.data.htmlContent;
      this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
      this.loading = false;
    } else {
      // Otherwise load document from API
      this.loadDocumentContent();
    }
  }
  
  loadDocumentContent(): void {
    if (this.data.info.documentId) {
      this.loading = true;
      this.error = '';
      
      this.internalInfoService.getWordDocumentContent(this.data.info.documentId).subscribe({
        next: (content) => {
          this.htmlContent = content;
          this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(content);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading document content:', err);
          this.error = 'Failed to load document content. Please try again later.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'No document ID available.';
      this.loading = false;
    }
  }
  
  onClose(): void {
    this.dialogRef.close();
  }
} 