import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSolutionsComponent } from './group-solutions.component';

describe('GroupSolutionsComponent', () => {
  let component: GroupSolutionsComponent;
  let fixture: ComponentFixture<GroupSolutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupSolutionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
