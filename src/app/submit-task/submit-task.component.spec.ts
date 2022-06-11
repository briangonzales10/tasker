import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitTaskComponent } from './submit-task.component';

describe('SubmitTaskComponent', () => {
  let component: SubmitTaskComponent;
  let fixture: ComponentFixture<SubmitTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubmitTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
