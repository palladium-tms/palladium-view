import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultSetsComponent } from './result-sets.component';

describe('ResultSetsComponent', () => {
  let component: ResultSetsComponent;
  let fixture: ComponentFixture<ResultSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultSetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
