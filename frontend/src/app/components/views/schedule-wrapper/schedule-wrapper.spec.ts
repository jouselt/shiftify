import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleWrapper } from './schedule-wrapper';

describe('ScheduleWrapper', () => {
  let component: ScheduleWrapper;
  let fixture: ComponentFixture<ScheduleWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduleWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
