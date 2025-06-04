import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Marca {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  foto_perfil_url: string | null;  // 👈 cambio aquí
}


@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  marcas: Marca[] = [];
  filteredMarcas: Marca[] = [];

  selectedMarca: Marca = {
    id: 0,
    nombre: '',
    descripcion: null,
    estado: true,
    foto_perfil_url: null
  };

  selectedFile: File | null = null;
  previewImage: string | ArrayBuffer | null = null;

  isLoading = false;
  isSaving = false;
  showModal = false;
  isEditMode = false;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMarcas();
  }

  loadMarcas() {
    this.isLoading = true;
    this.http.get<Marca[]>('http://137.184.94.190/api/marcas/').subscribe({
      next: data => {
        this.marcas = data;
        this.filteredMarcas = data;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.handleHttpError(err);
      }
    });
  }

  filterMarcas() {
    const term = this.searchTerm.toLowerCase();
    this.filteredMarcas = this.marcas.filter(m => m.nombre.toLowerCase().includes(term));
    this.currentPage = 1;
  }

  paginatedMarcas(): Marca[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMarcas.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredMarcas.length / this.itemsPerPage);
  }

  addMarca() {
    this.selectedMarca = {
      id: 0,
      nombre: '',
      descripcion: null,
      estado: true,
      foto_perfil_url: null
    };
    this.selectedFile = null;
    this.previewImage = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editMarca(marca: Marca) {
    this.selectedMarca = { ...marca };
    this.previewImage = marca.foto_perfil_url || null; // 👈 cambia logo_url por foto_perfil_url
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

  saveMarca() {
    const formData = new FormData();
    formData.append('nombre', this.selectedMarca.nombre);
    if (this.selectedMarca.descripcion)
      formData.append('descripcion', this.selectedMarca.descripcion);
    formData.append('estado', this.selectedMarca.estado.toString());
    if (this.selectedFile)
      formData.append('foto_perfil', this.selectedFile); // 👈 cambia 'logo' por 'foto_perfil'


    const url = this.isEditMode
      ? `http://137.184.94.190/api/marcas/${this.selectedMarca.id}/`
      : 'http://137.184.94.190/api/marcas/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('✅ Guardado', `Marca ${this.isEditMode ? 'actualizada' : 'creada'} correctamente.`, 'success');
        this.loadMarcas();
        this.showModal = false;
        this.isSaving = false;
      },
      error: err => {
        this.isSaving = false;
        this.handleHttpError(err);
      }
    });
  }

  deleteMarca(id: number) {
    Swal.fire({
      title: '¿Eliminar marca?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/marcas/${id}/`).subscribe({
          next: () => {
            Swal.fire('🗑️ Eliminado', 'La marca fue eliminada.', 'success');
            this.loadMarcas();
          },
          error: err => this.handleHttpError(err)
        });
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.previewImage = null;
    this.selectedFile = null;
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  private handleHttpError(error: any) {
    console.error('HTTP Error:', error);
    Swal.fire('❌ Error', 'Ocurrió un error en el servidor.', 'error');
  }
}
