// 1️⃣ Comando Angular para crear el componente (dentro de la carpeta `business`):
// Ejecuta esto en terminal:
// ng generate component business/cursos --standalone --flat

// 2️⃣ Código .ts adaptado desde materias

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Curso {
  id: number;
  nombre: string;
  aula: string;
  activo: boolean;
  nivel: number;
  nivel_id?: number;
  nivel_nombre?: string;
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {

  readonly aulasDisponibles = [
    'Aula 1', 'Aula 2', 'Aula 3', 'Aula 4', 'Aula 5',
    'Aula 6', 'Aula 7', 'Aula 8', 'Aula 9', 'Aula 10',
    'Aula A', 'Aula B', 'Aula C',
    '1er Piso - Aula A', '1er Piso - Aula B',
    '2do Piso - Aula A', '2do Piso - Aula B',
    'Bloque A - Aula 1', 'Bloque A - Aula 2',
    'Bloque B - Aula 1', 'Bloque B - Aula 2',
    'Kinder A', 'Kinder B',
    'Pre-Kinder',
    'Sala de Música', 'Sala de Computación', 'Laboratorio', 'Biblioteca'
  ];

  readonly cursosDisponibles = [
    'Pre-Kinder', 'Kinder',
    '1ro', '1ro A', '1ro B', '1ro C',
    '2do', '2do A', '2do B', '2do C',
    '3ro', '3ro A', '3ro B', '3ro C',
    '4to', '4to A', '4to B', '4to C',
    '5to', '5to A', '5to B', '5to C',
    '6to', '6to A', '6to B', '6to C'
  ];

  cursos: Curso[] = [];
  filteredCursos: Curso[] = [];
  niveles: { id: number; nombre: string }[] = [];

  selectedCurso: Partial<Curso> = {
    id: 0,
    nombre: '',
    aula: '',
    activo: true,
    nivel: 0,
  };

  readonly apiUrl = 'http://localhost:8000/api/cursos/';
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
    this.loadCursos();
    this.loadNiveles();
  }

  loadCursos() {
    this.isLoading = true;
    this.http.get<Curso[]>(this.apiUrl).subscribe({
      next: data => {
        this.cursos = data;
        this.filteredCursos = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los cursos.', 'error');
      }
    });
  }

  loadNiveles() {
    this.http.get<any[]>(this.apiNivelesUrl).subscribe({
      next: data => this.niveles = data,
      error: () => Swal.fire('Error', 'No se pudieron cargar los niveles.', 'error')
    });
  }

  filterCursos() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCursos = this.cursos.filter(c =>
      c.nombre.toLowerCase().includes(term) ||
      (c.nivel_nombre || '').toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedCursos(): Curso[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCursos.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredCursos.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addCurso() {
    this.selectedCurso = { id: 0, nombre: '', aula: '', activo: true, nivel: 0 };
    this.isEditMode = false;
    this.showModal = true;
  }

  editCurso(curso: Curso) {
    this.selectedCurso = {
      id: curso.id,
      nombre: curso.nombre,
      aula: curso.aula,
      activo: curso.activo,
      nivel: curso.nivel_id ?? curso.nivel
    };
    this.isEditMode = true;
    this.showModal = true;
  }

  deleteCurso(id: number) {
    Swal.fire({
      title: '¿Eliminar curso?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Curso eliminado correctamente.', 'success');
            this.loadCursos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el curso.', 'error')
        });
      }
    });
  }

  saveCurso() {
    if (!this.selectedCurso.nombre || !this.selectedCurso.nivel || !this.selectedCurso.aula) {
      Swal.fire('Campos obligatorios', 'Nombre, nivel y aula son requeridos.', 'warning');
      return;
    }

    const payload = {
      nombre: this.selectedCurso.nombre,
      aula: this.selectedCurso.aula,
      activo: this.selectedCurso.activo,
      nivel_id: this.selectedCurso.nivel
    };

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedCurso.id}/`, payload)
      : this.http.post(this.apiUrl, payload);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire('Guardado', 'Curso guardado correctamente.', 'success');
        this.showModal = false;
        this.loadCursos();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('❌ Error al guardar curso:', err);
        let mensaje = 'No se pudo guardar el curso.';
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
