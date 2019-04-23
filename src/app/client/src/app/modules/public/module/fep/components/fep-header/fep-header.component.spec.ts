import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FepHeaderComponent } from './fep-header.component';

describe('FepHeaderComponent', () => {
  let component: FepHeaderComponent;
  let fixture: ComponentFixture<FepHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FepHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FepHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
