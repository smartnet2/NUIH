import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FepHomeHeaderComponent } from './fep-home-header.component';

describe('FepHomeHeaderComponent', () => {
  let component: FepHomeHeaderComponent;
  let fixture: ComponentFixture<FepHomeHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FepHomeHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FepHomeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
