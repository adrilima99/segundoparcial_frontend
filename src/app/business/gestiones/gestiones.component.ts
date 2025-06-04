// gestiones.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface GestionAcademica {
  id: number;
  anio: string;
  descripcion: string;
  activa: boolean;
  creado_en?: string;
}

@Component({
  selector: 'app-gestiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestiones.component.html',
  styleUrls: ['./gestiones.component.css']
})
export class GestionesComponent implements OnInit {
  gestiones: GestionAcademica[] = [];
  filteredGestiones: GestionAcademica[] = [];
  selectedGestion: GestionAcademica = { id: 0, anio: '', descripcion: '', activa: true };

  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  readonly apiUrl = 'http://localhost:8000/api/gestiones/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGestiones();
  }

  loadGestiones() {
    this.isLoading = true;
    this.http.get<GestionAcademica[]>(this.apiUrl).subscribe({
      next: data => {
        this.gestiones = data;
        this.filteredGestiones = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar las gestiones.', 'error');
      }
    });
  }

  filterGestiones() {
    const term = this.searchTerm.toLowerCase();
    this.filteredGestiones = this.gestiones.filter(g =>
      g.anio.toLowerCase().includes(term) ||
      g.descripcion.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedGestiones(): GestionAcademica[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredGestiones.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredGestiones.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addGestion() {
    this.selectedGestion = { id: 0, anio: '', descripcion: '', activa: true };
    this.isEditMode = false;
    this.showModal = true;
  }

  editGestion(gestion: GestionAcademica) {
    this.selectedGestion = { ...gestion };
    this.isEditMode = true;
    this.showModal = true;
  }

  deleteGestion(id: number) {
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
            Swal.fire('Eliminado', 'Gestión eliminada correctamente.', 'success');
            this.loadGestiones();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  saveGestion() {
    if (!this.selectedGestion.anio.trim()) {
      Swal.fire('Error', 'El anio es obligatorio.', 'warning');
      return;
    }

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}${this.selectedGestion.id}/`, this.selectedGestion)
      : this.http.post(this.apiUrl, this.selectedGestion);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        Swal.fire('Guardado', 'Gestión guardada correctamente.', 'success');
        this.showModal = false;
        this.isSaving = false;
        this.loadGestiones();
      },
      error: () => {
        this.isSaving = false;
        Swal.fire('Error', 'No se pudo guardar la gestión.', 'error');
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }
}
