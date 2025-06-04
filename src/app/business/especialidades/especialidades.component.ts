import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Especialidad {
  id: number;
  nombre: string;
  nivel: string;
  nivel_nombre: string;
  colegio_nombre: string;
}

interface Nivel {
  id: number;
  nombre_display: string;
  colegio_nombre: string;
}

interface Profesor {
  id: number;
  nombre: string;
  ci: string;
  username: string;
  email: string;
  checked?: boolean;
  anteriormenteAsignado?: boolean;
}

@Component({
  selector: 'app-especialidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadesComponent implements OnInit {
  isLoading = false;
  isSaving = false;
  showModal = false;
  showAsignarModal = false;
  isEditMode = false;

  especialidadesDisponibles: string[] = [
    'Lenguaje y Comunicación', 'Matemática', 'Ciencias Naturales', 'Ciencias Sociales',
    'Educación Física', 'Educación Musical', 'Educación Artística', 'Educación Religiosa',
    'Tecnología', 'Idiomas', 'Filosofía', 'Física', 'Química', 'Biología',
    'Historia', 'Geografía', 'Psicología', 'Alemán', 'Inglés', 'Francés',
    'Computación', 'Robótica', 'Artes Plásticas', 'Educación Cívica'
  ];

  especialidades: Especialidad[] = [];
  niveles: Nivel[] = [];
  profesoresDisponibles: Profesor[] = [];
  profesoresAsignados: Profesor[] = [];
  searchTerm = '';
  filteredEspecialidades: Especialidad[] = [];
  selected: Partial<Especialidad> = {
    id: 0,
    nombre: '',
    nivel: ''
  };
  selectedEspecialidadId: number | null = null;

  currentPage = 1;
  itemsPerPage = 5;

  readonly apiUrl = 'http://localhost:8000/api/especialidades/';
  readonly nivelesUrl = 'http://localhost:8000/api/niveles/';
  readonly profesoresUrl = 'http://localhost:8000/api/usuarios/profesores-disponibles/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEspecialidades();
    this.loadNiveles();
  }

  loadEspecialidades() {
    this.isLoading = true;
    this.http.get<Especialidad[]>(this.apiUrl).subscribe(data => {
      this.especialidades = data;
      this.filteredEspecialidades = data;
      this.isLoading = false;
    });
  }

  loadNiveles() {
    this.http.get<Nivel[]>(this.nivelesUrl).subscribe(data => {
      this.niveles = data;
    });
  }

  openAsignarModal(especialidadId: number) {
    this.selectedEspecialidadId = especialidadId;
    this.showAsignarModal = true;

    this.http.get<Profesor[]>(this.profesoresUrl).subscribe(profesores => {
      this.http.get<Profesor[]>(`${this.apiUrl}${especialidadId}/profesores/`).subscribe(asignados => {
        const asignadosIds = new Set(asignados.map(p => p.id));

        this.profesoresDisponibles = profesores.map(p => ({
          ...p,
          checked: asignadosIds.has(p.id),
          anteriormenteAsignado: asignadosIds.has(p.id),
          nombre: `${p.nombre}`
        }));

        this.profesoresAsignados = this.profesoresDisponibles.filter(p => p.checked);
      });
    });
  }

  asignarEspecialidades() {
    if (this.selectedEspecialidadId === null) return;

    const seleccionados = this.profesoresDisponibles.filter(p => p.checked).map(p => p.id);
    const desmarcados = this.profesoresDisponibles
      .filter(p => !p.checked && p.anteriormenteAsignado)
      .map(p => p.id);

    console.log('✅ Asignar a:', seleccionados);
    console.log('❌ Quitar a:', desmarcados);

    const peticionesAsignar = seleccionados.map(profesorId => {
      return this.http.post(`http://localhost:8000/api/usuarios/${profesorId}/asignar-especialidades/`, {
        especialidades: [this.selectedEspecialidadId]
      }).toPromise();
    });

    let peticionQuitar: Promise<any> = Promise.resolve();

    if (desmarcados.length > 0) {
      peticionQuitar = this.http.post(`http://localhost:8000/api/especialidades/${this.selectedEspecialidadId}/quitar-profesores/`, {
        profesores: desmarcados
      }).toPromise();
    }

    Promise.all([...peticionesAsignar, peticionQuitar]).then(() => {
      Swal.fire('✅ Cambios guardados', 'Se actualizaron las asignaciones correctamente.', 'success');
      this.showAsignarModal = false;
    }).catch(() => {
      Swal.fire('❌ Error', 'No se pudieron guardar los cambios.', 'error');
    });
  }

  filterEspecialidades() {
    const term = this.searchTerm.toLowerCase();
    this.filteredEspecialidades = this.especialidades.filter(e =>
      e.nombre.toLowerCase().includes(term) ||
      e.nivel_nombre.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedEspecialidades(): Especialidad[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEspecialidades.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredEspecialidades.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addEspecialidad() {
    this.selected = { id: 0, nombre: '', nivel: '' };
    this.isEditMode = false;
    this.showModal = true;
  }

  editEspecialidad(especialidad: Especialidad) {
    this.selected = {
      id: especialidad.id,
      nombre: especialidad.nombre,
      nivel: especialidad.nivel
    };
    this.isEditMode = true;
    this.showModal = true;
  }

  saveEspecialidad() {
    if (!this.selected.nombre || !this.selected.nivel) {
      Swal.fire('Campos obligatorios', 'Debes completar todos los campos.', 'warning');
      return;
    }

    const payload = {
      nombre: this.selected.nombre,
      nivel: this.selected.nivel
    };

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selected.id}/`, payload)
      : this.http.post(this.apiUrl, payload);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Éxito', `Especialidad ${this.isEditMode ? 'actualizada' : 'creada'} correctamente`, 'success');
        this.loadEspecialidades();
        this.closeModal();
        this.isSaving = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar la especialidad.', 'error');
        this.isSaving = false;
      }
    });
  }

  deleteEspecialidad(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe(() => {
          Swal.fire('Eliminado', 'Especialidad eliminada correctamente', 'success');
          this.loadEspecialidades();
        });
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selected = {};
  }

  closeAsignarModal() {
    this.showAsignarModal = false;
    this.profesoresDisponibles = [];
    this.selectedEspecialidadId = null;
  }
}
