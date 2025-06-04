// niveles.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface NivelEducativo {
  id: number;
  nombre: string;
  descripcion: string;
  colegio: number;
  colegio_nombre?: string;
}

interface OpcionNivel {
  value: string;
  label: string;
}

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './niveles.component.html',
  styleUrls: ['./niveles.component.css']
})
export class NivelesComponent implements OnInit {
  niveles: NivelEducativo[] = [];
  filteredNiveles: NivelEducativo[] = [];
  opcionesNivel: OpcionNivel[] = [];
  selectedNivel: NivelEducativo = { id: 0, nombre: '', descripcion: '', colegio: 0 };

  nombreColegio: string = '';
  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  readonly apiUrl = 'http://localhost:8000/api/niveles/';
  readonly apiOpcionesUrl = 'http://localhost:8000/api/niveles-disponibles/';
  readonly apiColegioUrl = 'http://localhost:8000/api/colegios/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadNiveles();
    this.loadNombreColegio();
  }

  loadNombreColegio() {
    this.http.get<any[]>(this.apiColegioUrl).subscribe({
      next: data => {
        if (data.length > 0) {
          this.nombreColegio = data[0].nombre;
          this.selectedNivel.colegio = data[0].id;
        }
      },
      error: () => {
        Swal.fire('Error', 'No se pudo obtener el colegio.', 'error');
      }
    });
  }

  loadNiveles() {
    this.isLoading = true;
    this.http.get<NivelEducativo[]>(this.apiUrl).subscribe({
      next: data => {
        this.niveles = data;
        this.filteredNiveles = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los niveles.', 'error');
      }
    });
  }

  loadOpcionesNivel() {
    this.http.get<OpcionNivel[]>(this.apiOpcionesUrl).subscribe({
      next: data => this.opcionesNivel = data,
      error: () => Swal.fire('Error', 'No se pudieron obtener los niveles disponibles.', 'error')
    });
  }

  filterNiveles() {
    const term = this.searchTerm.toLowerCase();
    this.filteredNiveles = this.niveles.filter(n =>
      n.nombre.toLowerCase().includes(term) ||
      n.descripcion.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedNiveles(): NivelEducativo[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNiveles.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredNiveles.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addNivel() {
    this.selectedNivel = { id: 0, nombre: '', descripcion: '', colegio: this.selectedNivel.colegio };
    this.loadOpcionesNivel();
    this.isEditMode = false;
    this.showModal = true;
  }

  editNivel(nivel: NivelEducativo) {
    this.selectedNivel = { ...nivel };
    if (!this.opcionesNivel.length) {
      this.loadOpcionesNivel();
    }
    this.isEditMode = true;
    this.showModal = true;
  }

  deleteNivel(id: number) {
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
            Swal.fire('Eliminado', 'Nivel eliminado correctamente.', 'success');
            this.loadNiveles();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  saveNivel() {
    if (!this.selectedNivel.nombre.trim()) {
      Swal.fire('Error', 'El nombre es obligatorio.', 'warning');
      return;
    }

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedNivel.id}/`, this.selectedNivel)
      : this.http.post(this.apiUrl, this.selectedNivel);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        Swal.fire('Guardado', 'Nivel guardado correctamente.', 'success');
        this.showModal = false;
        this.isSaving = false;
        this.loadNiveles();
      },
      error: () => {
        this.isSaving = false;
        Swal.fire('Error', 'No se pudo guardar el nivel.', 'error');
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }
  getLabelNivel(valor: string): string {
    const opcion = this.opcionesNivel.find(op => op.value === valor);
    return opcion ? opcion.label : valor;
  }

}
