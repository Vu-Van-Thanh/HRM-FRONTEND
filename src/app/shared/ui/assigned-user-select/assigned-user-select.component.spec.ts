import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedUserSelectComponent } from './assigned-user-select.component';

describe('AssignedUserSelectComponent', () => {
  let component: AssignedUserSelectComponent;
  let fixture: ComponentFixture<AssignedUserSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignedUserSelectComponent]
    });
    fixture = TestBed.createComponent(AssignedUserSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
