import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FepComponent } from './fep.component';

describe('FepComponent', () => {
  let component: FepComponent;
  let fixture: ComponentFixture<FepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
