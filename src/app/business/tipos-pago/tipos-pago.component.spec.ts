import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposPagoComponent } from './tipos-pago.component';

describe('TiposPagoComponent', () => {
  let component: TiposPagoComponent;
  let fixture: ComponentFixture<TiposPagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposPagoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
