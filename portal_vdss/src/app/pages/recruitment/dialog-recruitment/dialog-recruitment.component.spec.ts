import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRecruitmentComponent } from './dialog-recruitment.component';

describe('DialogRecruitmentComponent', () => {
  let component: DialogRecruitmentComponent;
  let fixture: ComponentFixture<DialogRecruitmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogRecruitmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogRecruitmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
