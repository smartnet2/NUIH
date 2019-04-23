import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FepFooterComponent } from './fep-footer.component';

describe('FepFooterComponent', () => {
  let component: FepFooterComponent;
  let fixture: ComponentFixture<FepFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FepFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FepFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
