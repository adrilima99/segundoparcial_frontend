import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloqueHorarioComponent } from './bloque-horario.component';

describe('BloqueHorarioComponent', () => {
  let component: BloqueHorarioComponent;
  let fixture: ComponentFixture<BloqueHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloqueHorarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloqueHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
