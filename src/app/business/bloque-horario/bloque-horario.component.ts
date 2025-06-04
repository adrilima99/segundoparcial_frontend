import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface BloqueHorario {
  id: number;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
}

@Component({
  selector: 'app-bloque-horario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bloque-horario.component.html',
  styleUrls: ['./bloque-horario.component.css']
})
export class BloqueHorarioComponent implements OnInit {

  bloquesSugeridos: BloqueHorario[] = [
    { nombre: 'Bloque 1', hora_inicio: '08:00', hora_fin: '09:15', id: 0 },
    { nombre: 'Recreo 1', hora_inicio: '09:15', hora_fin: '09:30', id: 0 },
    { nombre: 'Bloque 2', hora_inicio: '09:30', hora_fin: '10:45', id: 0 },
    { nombre: 'Recreo 2', hora_inicio: '10:45', hora_fin: '11:00', id: 0 },
    { nombre: 'Bloque 3', hora_inicio: '11:00', hora_fin: '12:15', id: 0 },
    { nombre: 'Tarde - Bloque 1', hora_inicio: '14:00', hora_fin: '15:15', id: 0 },
    { nombre: 'Tarde - Bloque 2', hora_inicio: '15:30', hora_fin: '16:45', id: 0 },
    { nombre: 'Tarde - Bloque 3', hora_inicio: '17:00', hora_fin: '18:15', id: 0 },
  ];


  bloques: BloqueHorario[] = [];
  filteredBloques: BloqueHorario[] = [];

  selectedBloque: Partial<BloqueHorario> = {
    id: 0,
    nombre: '',
    hora_inicio: '',
    hora_fin: ''
  };

  readonly apiUrl = 'http://localhost:8000/api/bloques-horarios/';

  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBloques();
  }

  loadBloques() {
    this.isLoading = true;
    this.http.get<BloqueHorario[]>(this.apiUrl).subscribe({
      next: data => {
        this.bloques = data;
        this.filteredBloques = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los bloques.', 'error');
      }
    });
  }


  bloqueSeleccionadoSugerido: BloqueHorario | null = null;

  aplicarSugerido() {
    if (this.bloqueSeleccionadoSugerido) {
      this.selectedBloque.nombre = this.bloqueSeleccionadoSugerido.nombre;
      this.selectedBloque.hora_inicio = this.bloqueSeleccionadoSugerido.hora_inicio;
      this.selectedBloque.hora_fin = this.bloqueSeleccionadoSugerido.hora_fin;
    }
  }


  filterBloques() {
    const term = this.searchTerm.toLowerCase();
    this.filteredBloques = this.bloques.filter(b =>
      b.nombre.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedBloques(): BloqueHorario[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBloques.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredBloques.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addBloque() {
    this.selectedBloque = { id: 0, nombre: '', hora_inicio: '', hora_fin: '' };
    this.isEditMode = false;
    this.showModal = true;
  }

  editBloque(bloque: BloqueHorario) {
    this.selectedBloque = { ...bloque };
    this.isEditMode = true;
    this.showModal = true;
  }

  deleteBloque(id: number) {
    Swal.fire({
      title: '¿Eliminar bloque?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Bloque eliminado correctamente.', 'success');
            this.loadBloques();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el bloque.', 'error')
        });
      }
    });
  }

  saveBloque() {
    if (!this.selectedBloque.nombre || !this.selectedBloque.hora_inicio || !this.selectedBloque.hora_fin) {
      Swal.fire('Campos obligatorios', 'Todos los campos son requeridos.', 'warning');
      return;
    }

    const payload = {
      nombre: this.selectedBloque.nombre,
      hora_inicio: this.selectedBloque.hora_inicio,
      hora_fin: this.selectedBloque.hora_fin
    };

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedBloque.id}/`, payload)
      : this.http.post(this.apiUrl, payload);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire('Guardado', 'Bloque guardado correctamente.', 'success');
        this.showModal = false;
        this.loadBloques();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('❌ Error al guardar bloque:', err);
        let mensaje = 'No se pudo guardar el bloque.';
        const errores = err?.error;
        if (typeof errores === 'string') mensaje = errores;
        else if (errores?.detail) mensaje = errores.detail;
        else if (errores?.non_field_errors?.length) mensaje = errores.non_field_errors[0];
        else {
          const clave = Object.keys(errores)[0];
          mensaje = errores[clave][0];
        }
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }
}
