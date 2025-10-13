import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftDialog } from './shift-dialog';

describe('ShiftDialog', () => {
  let component: ShiftDialog;
  let fixture: ComponentFixture<ShiftDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShiftDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
