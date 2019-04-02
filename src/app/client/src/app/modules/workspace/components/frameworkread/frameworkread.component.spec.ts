import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkreadComponent } from './frameworkread.component';

describe('FrameworkreadComponent', () => {
  let component: FrameworkreadComponent;
  let fixture: ComponentFixture<FrameworkreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrameworkreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameworkreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
