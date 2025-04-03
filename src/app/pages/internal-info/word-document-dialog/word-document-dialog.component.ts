import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InternalInfoService } from '../services/internal-info.service';
import { InternalInfo } from '../models/internal-info.model';

@Component({
  selector: 'app-word-document-dialog',
  templateUrl: './word-document-dialog.component.html',
  styleUrls: ['./word-document-dialog.component.scss']
})
export class WordDocumentDialogComponent implements OnInit {
  htmlContent: string = '';
  loading: boolean = true;
  error: string = '';
  
  constructor(
    public dialogRef: MatDialogRef<WordDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { info: InternalInfo },
    private internalInfoService: InternalInfoService
  ) { }
  
  ngOnInit(): void {
    this.loadDocumentContent();
  }
  
  loadDocumentContent(): void {
    if (this.data.info.documentId) {
      this.loading = true;
      this.error = '';
      
      this.internalInfoService.getWordDocumentContent(this.data.info.documentId).subscribe({
        next: (content) => {
          this.htmlContent = content;
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