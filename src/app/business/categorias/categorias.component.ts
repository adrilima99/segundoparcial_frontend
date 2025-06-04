import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  foto_perfil: string | null;        // para enviar imagen
  foto_perfil_url: string | null;    // para mostrar imagen
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css']
})
export class CategoriasComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  isSaving = false;

  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];

  selectedCategoria: Categoria = {
    id: 0,
    nombre: '',
    descripcion: null,
    estado: true,
    foto_perfil: null,
    foto_perfil_url: null
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
    this.loadCategorias();
  }

  loadCategorias() {
    this.isLoading = true;
    this.http.get<Categoria[]>('http://137.184.94.190/api/categorias/').subscribe({
      next: data => {
        this.categorias = data;
        this.filteredCategorias = data;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    });
  }

  filterCategorias() {
    this.currentPage = 1;
    const term = this.searchTerm.toLowerCase();
    this.filteredCategorias = this.categorias.filter(c =>
      c.nombre.toLowerCase().includes(term)
    );
  }

  paginatedCategorias(): Categoria[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCategorias.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredCategorias.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addCategoria() {
    this.selectedCategoria = {
      id: 0,
      nombre: '',
      descripcion: null,
      estado: true,
      foto_perfil: null,
      foto_perfil_url: null
    };
    this.previewImage = null;
    this.selectedFile = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editCategoria(cat: Categoria) {
    this.selectedCategoria = { ...cat };
    this.previewImage = cat.foto_perfil_url || null;
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

  saveCategoria() {
    const formData = new FormData();
    formData.append('nombre', this.selectedCategoria.nombre);
    if (this.selectedCategoria.descripcion) {
      formData.append('descripcion', this.selectedCategoria.descripcion);
    }
    formData.append('estado', this.selectedCategoria.estado.toString());
    if (this.selectedFile) {
      formData.append('foto_perfil', this.selectedFile);
    }

    const url = this.isEditMode
      ? `http://137.184.94.190/api/categorias/${this.selectedCategoria.id}/`
      : 'http://137.184.94.190/api/categorias/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', `Categoría ${this.isEditMode ? 'actualizada' : 'creada'} correctamente.`, 'success');
        this.loadCategorias();
        this.showModal = false;
        this.isSaving = false;
      },
      error: error => {
        this.isSaving = false;
        this.handleHttpError(error);
      }
    });
  }

  deleteCategoria(id: number) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/categorias/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La categoría fue eliminada.', 'success');
            this.loadCategorias();
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
