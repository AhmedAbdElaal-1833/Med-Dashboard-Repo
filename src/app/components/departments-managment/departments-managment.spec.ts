import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsManagment } from './departments-managment';

describe('DepartmentsManagment', () => {
  let component: DepartmentsManagment;
  let fixture: ComponentFixture<DepartmentsManagment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsManagment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentsManagment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
