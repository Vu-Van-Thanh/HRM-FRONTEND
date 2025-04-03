import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-word-content-viewer',
  templateUrl: './word-content-viewer.component.html',
  styleUrls: ['./word-content-viewer.component.scss']
})
export class WordContentViewerComponent implements OnInit, OnChanges {
  @Input() htmlContent: string;
  @Input() title: string;
  @Input() loading: boolean = false;
  
  safeHtml: SafeHtml;
  
  constructor(private sanitizer: DomSanitizer) { }
  
  ngOnInit(): void {
    this.updateSafeHtml();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.htmlContent) {
      this.updateSafeHtml();
    }
  }
  
  private updateSafeHtml(): void {
    if (this.htmlContent) {
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlContent);
    } else {
      this.safeHtml = '';
    }
  }
} 