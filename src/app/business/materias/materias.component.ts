import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Materia {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: any; // o mejor: { id: number, nombre: string } si personalizas más
  nivel_id?: number;
  nivel_nombre?: string;
}


@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css']
})
export class MateriasComponent implements OnInit {
  materias: Materia[] = [];
  filteredMaterias: Materia[] = [];
  niveles: { id: number; nombre: string }[] = [];
  readonly materiasDisponibles = [
    'Matemática',
    'Lenguaje y Comunicación',
    'Ciencias Naturales',
    'Física',
    'Química',
    'Biología',
    'Geografía',
    'Historia',
    'Educación Cívica',
    'Educación Física',
    'Artes Plásticas',
    'Música',
    'Religión',
    'Tecnología',
    'Inglés',
    'Aymara',
    'Quechua',
    'Guaraní',
    'Educación para la Ciudadanía',
    'Psicología',
    'Filosofía',
    'Educación Sexual',
    'Educación Medioambiental'
  ];

  selectedMateria: Partial<Materia> = {
    id: 0,
    nombre: '',
    descripcion: '',
    nivel: 0,
  };

  readonly apiUrl = 'http://localhost:8000/api/materias/';
  readonly apiNivelesUrl = 'http://localhost:8000/api/niveles/';

  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMaterias();
    this.loadNiveles();
  }

  loadMaterias() {
    this.isLoading = true;
    this.http.get<Materia[]>(this.apiUrl).subscribe({
      next: data => {
        this.materias = data;
        this.filteredMaterias = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las materias.', 'error');
      }
    });
  }

  loadNiveles() {
    this.http.get<any[]>(this.apiNivelesUrl).subscribe({
      next: data => this.niveles = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los niveles.', 'error')
    });
  }

  filterMaterias() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMaterias = this.materias.filter(m =>
      m.nombre.toLowerCase().includes(term) ||
      (m.nivel_nombre || '').toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedMaterias(): Materia[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMaterias.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredMaterias.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addMateria() {
    this.selectedMateria = { id: 0, nombre: '', descripcion: '', nivel: 0 };
    this.isEditMode = false;
    this.showModal = true;
  }
  editMateria(materia: Materia) {
    this.selectedMateria = {
      id: materia.id,
      nombre: materia.nombre,
      descripcion: materia.descripcion,
      nivel: materia.nivel_id ?? materia.nivel  // 👈 Intenta usar nivel_id, o el fallback si lo tienes directo
    };
    this.isEditMode = true;
    this.showModal = true;
  }


  deleteMateria(id: number) {
    Swal.fire({
      title: '¿Eliminar materia?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Materia eliminada correctamente.', 'success');
            this.loadMaterias();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la materia.', 'error')
        });
      }
    });
  }

  saveMateria() {
    if (!this.selectedMateria.nombre || !this.selectedMateria.nivel) {
      Swal.fire('Campos obligatorios', 'Nombre y nivel son requeridos.', 'warning');
      return;
    }

    const payload = {
      nombre: this.selectedMateria.nombre,
      descripcion: this.selectedMateria.descripcion,
      nivel: this.selectedMateria.nivel,
      nivel_id: this.selectedMateria.nivel
    };



    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedMateria.id}/`, payload)
      : this.http.post(this.apiUrl, payload);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire('Guardado', 'Materia guardada correctamente.', 'success');
        this.showModal = false;
        this.loadMaterias();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('❌ Error al guardar materia:', err);

        let mensaje = 'No se pudo guardar la materia.';
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
