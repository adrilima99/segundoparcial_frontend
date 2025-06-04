import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Periodo {
  id: number;
  nombre: string;
  gestion: number;
  gestion_id?: number;
  gestion_anio?: string;
  activo: boolean;
  creado_en: string;
}

@Component({
  selector: 'app-periodos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './periodos.component.html',
  styleUrls: ['./periodos.component.css']
})
export class PeriodosComponent implements OnInit {
  periodos: Periodo[] = [];
  filteredPeriodos: Periodo[] = [];
  gestiones: { id: number; anio: string }[] = [];

  selectedPeriodo: Partial<Periodo> = {
    id: 0,
    nombre: '',
    gestion: 0,
    activo: true
  };

  readonly opcionesPeriodo = [
    { value: 'PRIMER_TRIMESTRE', label: 'Primer Trimestre' },
    { value: 'SEGUNDO_TRIMESTRE', label: 'Segundo Trimestre' },
    { value: 'TERCER_TRIMESTRE', label: 'Tercer Trimestre' },
    { value: 'REFORZAMIENTO', label: 'Reforzamiento' }
  ];

  apiUrl = 'http://localhost:8000/api/periodos/';
  apiGestionesUrl = 'http://localhost:8000/api/gestiones/';

  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPeriodos();
    this.loadGestiones();
  }

  loadPeriodos() {
    this.isLoading = true;
    this.http.get<Periodo[]>(this.apiUrl).subscribe({
      next: data => {
        this.periodos = data;
        this.filteredPeriodos = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los periodos.', 'error');
      }
    });
  }

  loadGestiones() {
    this.http.get<any[]>(this.apiGestionesUrl).subscribe({
      next: data => this.gestiones = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar las gestiones.', 'error')
    });
  }

  filterPeriodos() {
    const term = this.searchTerm.toLowerCase();
    this.filteredPeriodos = this.periodos.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      (p.gestion_anio || '').toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedPeriodos(): Periodo[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPeriodos.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredPeriodos.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addPeriodo() {
    this.selectedPeriodo = { id: 0, nombre: '', gestion: 0, activo: true };
    this.isEditMode = false;
    this.showModal = true;
  }

  editPeriodo(periodo: Periodo) {
    this.selectedPeriodo = {
      ...periodo,
      gestion: periodo.gestion_id  // 👈 ¡esto es clave!
    };
    this.isEditMode = true;
    this.showModal = true;
  }


  deletePeriodo(id: number) {
    Swal.fire({
      title: '¿Eliminar periodo?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Periodo eliminado correctamente.', 'success');
            this.loadPeriodos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el periodo.', 'error')
        });
      }
    });
  }

  savePeriodo() {
    if (!this.selectedPeriodo.nombre || !this.selectedPeriodo.gestion) {
      Swal.fire('Campos obligatorios', 'Nombre y gestión son requeridos.', 'warning');
      return;
    }

    const payload = {
      nombre: this.selectedPeriodo.nombre,
      gestion_id: this.selectedPeriodo.gestion,
      activo: this.selectedPeriodo.activo
    };

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedPeriodo.id}/`, payload)
      : this.http.post(this.apiUrl, payload);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire('Guardado', 'Periodo guardado correctamente.', 'success');
        this.showModal = false;
        this.loadPeriodos();
      },
      error: (err) => {
        this.isSaving = false;

        const errores = err?.error;

        let mensaje = 'No se pudo guardar el periodo.';

        if (errores) {
          if (typeof errores === 'string') {
            mensaje = errores;
          } else if (errores.non_field_errors?.length) {
            mensaje = errores.non_field_errors[0];
          } else {
            // Extrae el primer error que exista
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
