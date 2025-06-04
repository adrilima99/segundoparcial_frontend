import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Campana {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean; // ✅ ahora coincidente con el backend
}

@Component({
  selector: 'app-campanas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campanas.component.html',
  styleUrls: ['./campanas.component.css']
})
export class CampanasComponent implements OnInit {
  campanas: Campana[] = [];
  selectedCampana: Campana = this.getEmptyCampana();

  showModal = false;
  isEditMode = false;
  isLoading = false;
  isSaving = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;
  filteredCampanas: Campana[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCampanas();
  }

  getEmptyCampana(): Campana {
    return {
      id: 0,
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      activa: true
    };
  }

  loadCampanas() {
    this.isLoading = true;
    this.http.get<Campana[]>('http://137.184.94.190/api/campanas/').subscribe({
      next: data => {
        this.campanas = data;
        this.filterCampanas();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.handleHttpError(err);
      }
    });
  }

  showAddModal() {
    this.selectedCampana = this.getEmptyCampana();
    this.isEditMode = false;
    this.showModal = true;
  }

  showEditModal(campana: Campana) {
    this.selectedCampana = { ...campana };
    this.isEditMode = true;
    this.showModal = true;
  }

  closeModal() {
    this.selectedCampana = this.getEmptyCampana();
    this.showModal = false;
    this.isEditMode = false;
  }

  saveCampana() {
    console.log('Payload enviado:', this.selectedCampana); // ✅ solo log

    const url = this.isEditMode
      ? `http://137.184.94.190/api/campanas/${this.selectedCampana.id}/`
      : 'http://137.184.94.190/api/campanas/';

    const request = this.isEditMode
      ? this.http.put(url, this.selectedCampana)
      : this.http.post(url, this.selectedCampana);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        Swal.fire('Éxito', `Campaña ${this.isEditMode ? 'actualizada' : 'creada'} correctamente.`, 'success');
        this.loadCampanas();
        this.closeModal();
        this.isSaving = false;
      },
      error: err => {
        this.isSaving = false;
        const errores = this.formatErrors(err?.error);
        Swal.fire('Error al guardar', errores, 'error');
      }
    });
  }

  deleteCampana(id: number) {
    Swal.fire({
      title: '¿Eliminar campaña?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/campanas/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La campaña fue eliminada.', 'success');
            this.loadCampanas();
          },
          error: err => this.handleHttpError(err)
        });
      }
    });
  }

  filterCampanas() {
    this.filteredCampanas = this.campanas.filter(c =>
      c.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.currentPage = 1;
  }

  paginatedCampanas(): Campana[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCampanas.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredCampanas.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  private handleHttpError(error: any) {
    console.error('HTTP Error:', error);
    const errores = this.formatErrors(error?.error);
    Swal.fire('Error', errores, 'error');
  }

  private formatErrors(error: any): string {
    if (!error || typeof error !== 'object') return 'Error desconocido';
    return Object.entries(error).map(([campo, detalles]) => {
      if (Array.isArray(detalles)) {
        return `<strong>${campo}:</strong> ${detalles.join(', ')}`;
      } else if (detalles && typeof detalles === 'object') {
        return `<strong>${campo}:</strong><br>` +
          Object.entries(detalles)
            .map(([subcampo, valor]) => `&nbsp;&nbsp;→ ${subcampo}: ${valor}`)
            .join('<br>');
      }
      return `<strong>${campo}:</strong> ${JSON.stringify(detalles)}`;
    }).join('<br>');
  }
}
