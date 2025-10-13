import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Month } from './month';

describe('Month', () => {
  let component: Month;
  let fixture: ComponentFixture<Month>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Month]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Month);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
