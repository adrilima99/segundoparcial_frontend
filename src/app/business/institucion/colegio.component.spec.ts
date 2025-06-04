import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColegioComponent } from './colegio.component';

describe('ColegioComponent', () => {
  let component: ColegioComponent;
  let fixture: ComponentFixture<ColegioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColegioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColegioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
