import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectShiftDialog } from './select-shift-dialog';

describe('SelectShiftDialog', () => {
  let component: SelectShiftDialog;
  let fixture: ComponentFixture<SelectShiftDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectShiftDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectShiftDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
