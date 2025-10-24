import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShiftDialog } from './add-shift-dialog';

describe('AddShiftDialog', () => {
  let component: AddShiftDialog;
  let fixture: ComponentFixture<AddShiftDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddShiftDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddShiftDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
