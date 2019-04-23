import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FepCourseComponent } from './fep-course.component';

describe('FepCourseComponent', () => {
  let component: FepCourseComponent;
  let fixture: ComponentFixture<FepCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FepCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FepCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
