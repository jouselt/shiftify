import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Day } from './day';

describe('Day', () => {
  let component: Day;
  let fixture: ComponentFixture<Day>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Day]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Day);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
