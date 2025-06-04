import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesMasVendidosComponent } from './reportes-mas-vendidos.component';

describe('ReportesMasVendidosComponent', () => {
  let component: ReportesMasVendidosComponent;
  let fixture: ComponentFixture<ReportesMasVendidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesMasVendidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesMasVendidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
