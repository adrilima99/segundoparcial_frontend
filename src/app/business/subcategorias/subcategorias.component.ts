import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Categoria {
  id: number;
  nombre: string;
}

interface Subcategoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  categoria: number | Categoria | null;
  foto_perfil: string | null;        // Para envío
  foto_perfil_url: string | null;    // Para mostrar imagen
}

@Component({
  selector: 'app-subcategorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subcategorias.component.html',
  styleUrls: ['./subcategorias.component.css']
})
export class SubcategoriasComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  isSaving = false;

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  filteredSubcategorias: Subcategoria[] = [];

  selectedSubcategoria: Subcategoria = {
    id: 0,
    nombre: '',
    descripcion: null,
    estado: true,
    categoria: null,
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
    this.loadSubcategorias();
  }

  loadCategorias() {
    this.http.get<Categoria[]>('http://137.184.94.190/api/categorias/').subscribe({
      next: data => this.categorias = data,
      error: error => this.handleHttpError(error)
    });
  }

  loadSubcategorias() {
    this.isLoading = true;
    this.http.get<Subcategoria[]>('http://137.184.94.190/api/subcategorias/').subscribe({
      next: data => {
        this.subcategorias = data;
        this.filteredSubcategorias = data;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    });
  }

  filterSubcategorias() {
    this.currentPage = 1;
    const term = this.searchTerm.toLowerCase();
    this.filteredSubcategorias = this.subcategorias.filter(s =>
      s.nombre.toLowerCase().includes(term)
    );
  }

  paginatedSubcategorias(): Subcategoria[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSubcategorias.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredSubcategorias.length / this.itemsPerPage);
  }

  getCategoriaNombre(categoria: number | Categoria | null): string {
    if (!categoria) return 'Sin categoría';

    if (typeof categoria === 'object') return categoria.nombre;

    const cat = this.categorias.find(c => c.id === categoria);
    return cat ? cat.nombre : 'Sin categoría';
  }




  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addSubcategoria() {
    this.selectedSubcategoria = {
      id: 0,
      nombre: '',
      descripcion: null,
      estado: true,
      categoria: null,
      foto_perfil: null,
      foto_perfil_url: null
    };
    this.previewImage = null;
    this.selectedFile = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editSubcategoria(sub: Subcategoria) {
    this.selectedSubcategoria = { ...sub };
    this.previewImage = sub.foto_perfil_url || null;
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

  saveSubcategoria() {
    const formData = new FormData();
    formData.append('nombre', this.selectedSubcategoria.nombre);
    if (this.selectedSubcategoria.descripcion)
      formData.append('descripcion', this.selectedSubcategoria.descripcion);
    formData.append('estado', this.selectedSubcategoria.estado.toString());
    if (this.selectedSubcategoria.categoria !== null)
      formData.append('categoria', this.selectedSubcategoria.categoria.toString());
    if (this.selectedFile)
      formData.append('foto_perfil', this.selectedFile);

    const url = this.isEditMode
      ? `http://137.184.94.190/api/subcategorias/${this.selectedSubcategoria.id}/`
      : 'http://137.184.94.190/api/subcategorias/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', `Subcategoría ${this.isEditMode ? 'actualizada' : 'creada'} correctamente.`, 'success');
        this.loadSubcategorias();
        this.showModal = false;
        this.isSaving = false;
      },
      error: error => {
        this.isSaving = false;
        this.handleHttpError(error);
      }
    });
  }

  deleteSubcategoria(id: number) {
    Swal.fire({
      title: '¿Eliminar subcategoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/subcategorias/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La subcategoría fue eliminada.', 'success');
            this.loadSubcategorias();
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
