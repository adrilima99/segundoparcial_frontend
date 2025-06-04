import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Turno {
  id: number;
  nombre: string;
  gestion: number;
  gestion_anio?: string;
}

interface OpcionTurno {
  value: string;
  label: string;
}

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.css']
})
export class TurnosComponent implements OnInit {
  turnos: Turno[] = [];
  filteredTurnos: Turno[] = [];
  selectedTurno: Turno = { id: 0, nombre: '', gestion: 0 };

  gestiones: { id: number; anio: string }[] = [];
  opcionesTurno: OpcionTurno[] = [
    { value: 'MAÑANA', label: 'Mañana' },
    { value: 'TARDE', label: 'Tarde' },
    { value: 'NOCHE', label: 'Noche' }
  ];

  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  readonly apiUrl = 'http://localhost:8000/api/turnos/';
  readonly apiGestionesUrl = 'http://localhost:8000/api/gestiones/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTurnos();
    this.loadGestiones();
  }

  loadTurnos() {
    this.isLoading = true;
    this.http.get<Turno[]>(this.apiUrl).subscribe({
      next: data => {
        this.turnos = data;
        this.filteredTurnos = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los turnos.', 'error');
      }
    });
  }

  loadGestiones() {
    this.http.get<any[]>(this.apiGestionesUrl).subscribe({
      next: data => this.gestiones = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar las gestiones.', 'error')
    });
  }

  filterTurnos() {
    const term = this.searchTerm.toLowerCase();
    this.filteredTurnos = this.turnos.filter(t =>
      t.nombre.toLowerCase().includes(term) ||
      (t.gestion_anio || '').toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedTurnos(): Turno[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTurnos.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredTurnos.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addTurno() {
    this.selectedTurno = { id: 0, nombre: '', gestion: 0 };
    this.isEditMode = false;
    this.showModal = true;
  }

  editTurno(turno: Turno) {
    this.selectedTurno = { ...turno };
    this.isEditMode = true;
    this.showModal = true;
  }

  deleteTurno(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Turno eliminado correctamente.', 'success');
            this.loadTurnos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  saveTurno() {
    if (!this.selectedTurno.nombre || !this.selectedTurno.gestion) {
      Swal.fire('Error', 'Nombre y gestión son obligatorios.', 'warning');
      return;
    }

    // Adaptamos el payload: usamos `gestion_id` en lugar de `gestion`
    const turnoPayload: any = {
      ...this.selectedTurno,
      gestion_id: this.selectedTurno.gestion
    };
    delete turnoPayload.gestion;


    console.log('📤 Enviando turno:', turnoPayload); // 👈 para debug

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedTurno.id}/`, turnoPayload)
      : this.http.post(this.apiUrl, turnoPayload);


    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', 'Turno guardado correctamente.', 'success');
        this.showModal = false;
        this.isSaving = false;
        this.loadTurnos();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('❌ Error al guardar turno:', err);

        const errores = err?.error;
        let mensaje = 'No se pudo guardar el turno.';

        if (errores) {
          if (typeof errores === 'string') {
            mensaje = errores;
          } else if (errores.detail) {
            mensaje = errores.detail;
          } else if (errores.non_field_errors?.length) {
            mensaje = errores.non_field_errors[0];
          } else {
            // Busca el primer campo con error
            const primeraClave = Object.keys(errores)[0];
            if (errores[primeraClave]?.length) {
              mensaje = errores[primeraClave][0];
            }
          }
        }

        Swal.fire('Error', mensaje, 'error');
      }

    });
  }


  closeModal() {
    this.showModal = false;
  }
}
