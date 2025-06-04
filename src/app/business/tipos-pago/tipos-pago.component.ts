import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface TipoPago {
  id: number;
  nombre: string;
  imagen_url: string | null;
}

@Component({
  selector: 'app-tipos-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipos-pago.component.html',
  styleUrls: ['./tipos-pago.component.css']
})
export class TiposPagoComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  isSaving = false;

  tipos: TipoPago[] = [];
  filteredTipos: TipoPago[] = [];

  selectedTipo: TipoPago = {
    id: 0,
    nombre: '',
    imagen_url: null
  };

  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;
  showModal = false;
  isEditMode = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTiposPago();
  }

  loadTiposPago() {
    this.isLoading = true;
    this.http.get<TipoPago[]>('http://137.184.94.190/api/tipos-pago/').subscribe({
      next: data => {
        this.tipos = data;
        this.filteredTipos = data;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    });
  }

  filterTiposPago() {
    this.currentPage = 1;
    const term = this.searchTerm.toLowerCase();
    this.filteredTipos = this.tipos.filter(t =>
      t.nombre.toLowerCase().includes(term)
    );
  }

  paginatedTipos(): TipoPago[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTipos.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredTipos.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addTipo() {
    this.selectedTipo = {
      id: 0,
      nombre: '',
      imagen_url: null
    };
    this.previewImage = null;
    this.selectedFile = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editTipo(tipo: TipoPago) {
    this.selectedTipo = { ...tipo };
    this.previewImage = tipo.imagen_url || null;
    this.selectedFile = null;
    this.isEditMode = true;
    this.showModal = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewImage = reader.result;
      reader.readAsDataURL(file);
    }
  }

  saveTipo() {
    const formData = new FormData();
    formData.append('nombre', this.selectedTipo.nombre);
    if (this.selectedFile) {
      formData.append('imagen', this.selectedFile);
    }

    const url = this.isEditMode
      ? `http://137.184.94.190/api/tipos-pago/${this.selectedTipo.id}/`
      : 'http://137.184.94.190/api/tipos-pago/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', `Tipo de Pago ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`, 'success');
        this.loadTiposPago();
        this.showModal = false;
        this.isSaving = false;
      },
      error: error => {
        this.isSaving = false;
        this.handleHttpError(error);
      }
    });
  }

  deleteTipo(id: number) {
    Swal.fire({
      title: '¿Eliminar tipo de pago?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/tipos-pago/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El tipo de pago fue eliminado.', 'success');
            this.loadTiposPago();
          },
          error: err => this.handleHttpError(err)
        });
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
    this.previewImage = null;
  }

  private handleHttpError(error: any) {
    console.error('HTTP Error:', error);
    Swal.fire('Error', 'Ocurrió un error en el servidor.', 'error');
  }
}
