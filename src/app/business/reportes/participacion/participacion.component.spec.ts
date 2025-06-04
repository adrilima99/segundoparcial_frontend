import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipacionComponent } from './participacion.component';

describe('ParticipacionComponent', () => {
  let component: ParticipacionComponent;
  let fixture: ComponentFixture<ParticipacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
