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
  categoria: number;
}

interface Marca {
  id: number;
  nombre: string;
}

interface ImagenProducto {
  id?: number;
  imagen?: File;
  previewUrl?: string | ArrayBuffer | null;
  descripcion?: string;
  orden?: number;
  file_key?: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  codigo_barra: string;
  precio_unitario: number;
  unidad_medida: string;
  subcategoria: number | Subcategoria | null;
  marca: number | Marca | null;
  estado: boolean;
  imagenes?: ImagenProducto[];
  precio_compra: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductoComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  isSaving = false;

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  marcas: Marca[] = [];
  selectedMarca: number | null = null;
  selectedCategoria: number | null = null;


  productos: Producto[] = [];
  filteredProductos: Producto[] = [];

  selectedProducto: Producto = this.getEmptyProducto();
  imagenes: ImagenProducto[] = [];
  imagenesAEliminar: number[] = [];

  imagenesProductoModal: ImagenProducto[] = [];
  showModal = false;
  showImagenesModal = false;
  isEditMode = false;
  totalItems = 0;
  hasNextPage = false;
  hasPrevPage = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadSubcategorias();
    this.loadMarcas();
    this.loadProductos();
  }

  getEmptyProducto(): Producto {
    return {
      id: 0,
      nombre: '',
      descripcion: null,
      codigo_barra: '',
      precio_unitario: 0,
      unidad_medida: '',
      subcategoria: null,
      marca: null,
      estado: false,
      imagenes: [],
      precio_compra: 0,
    };
  }

  abrirImagenesModal(producto: Producto) {
    this.imagenesProductoModal = producto.imagenes?.map(img => ({
      ...img,
      previewUrl: (img as any).imagen_url || (typeof img.imagen === 'string' ? img.imagen : '')
    })) || [];
    this.showImagenesModal = true;
  }

  cerrarImagenesModal() {
    this.imagenesProductoModal = [];
    this.showImagenesModal = false;
  }

  loadCategorias() {
    this.http.get<Categoria[]>('http://137.184.94.190/api/categorias/').subscribe(data => this.categorias = data);
  }

  loadSubcategorias() {
    this.http.get<Subcategoria[]>('http://137.184.94.190/api/subcategorias/').subscribe(data => this.subcategorias = data);
  }

  loadMarcas() {
    this.http.get<Marca[]>('http://137.184.94.190/api/marcas/').subscribe(data => this.marcas = data);
  }

  getMarcaNombre(id: number | Marca | null): string {
    if (!id) return 'Sin marca';
    if (typeof id === 'object') return id.nombre;
    const marca = this.marcas.find(m => m.id === id);
    return marca ? marca.nombre : 'Sin marca';
  }

  getCategoriaNombre(sub: number | Subcategoria | null): string {
    if (!sub) return 'Sin categoría';
    const subId = typeof sub === 'object' ? sub.id : sub;
    const subObj = this.subcategorias.find(s => s.id === subId);
    const cat = this.categorias.find(c => c.id === subObj?.categoria);
    return cat ? cat.nombre : 'Sin categoría';
  }

  loadProductos(page: number = 1) {
    this.isLoading = true;
    this.http.get<any>(`http://137.184.94.190/api/productos/?sin_stock=all&page=${page}`).subscribe({
      next: data => {
        this.productos = data.results;
        this.filteredProductos = data.results;
        this.totalItems = data.count;
        this.hasNextPage = !!data.next;
        this.hasPrevPage = !!data.previous;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    });
  }

  filterProductos() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProductos = this.productos.filter(p => {
      const nombreMatch = p.nombre.toLowerCase().includes(term);

      const marcaMatch =
        this.selectedMarca === null ||
        (typeof p.marca === 'object' ? p.marca?.id : p.marca) === this.selectedMarca;

      const categoriaMatch = (() => {
        if (this.selectedCategoria === null) return true;
        const subId = typeof p.subcategoria === 'object' ? p.subcategoria?.id : p.subcategoria;
        const sub = this.subcategorias.find(s => s.id === subId);
        return sub?.categoria === this.selectedCategoria;
      })();

      return nombreMatch && marcaMatch && categoriaMatch;
    });

    this.currentPage = 1;
  }


  totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  nextPage() {
    if (this.hasNextPage) {
      this.loadProductos(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.hasPrevPage && this.currentPage > 1) {
      this.loadProductos(this.currentPage - 1);
    }
  }

  addProducto() {
    this.selectedProducto = this.getEmptyProducto();
    this.imagenes = [];
    this.imagenesAEliminar = [];
    this.showModal = true;
    this.isEditMode = false;
  }

  editProducto(producto: Producto) {
    this.selectedProducto = {
      ...producto,
      subcategoria: typeof producto.subcategoria === 'object' ? producto.subcategoria?.id ?? null : producto.subcategoria,
      marca: typeof producto.marca === 'object' ? producto.marca?.id ?? null : producto.marca
    };

    this.imagenes = producto.imagenes?.map((img, index) => ({
      id: img.id,
      previewUrl: (img as any).imagen_url || (typeof img.imagen === 'string' ? img.imagen : ''),
      descripcion: img.descripcion || '',
      orden: img.orden ?? index
    })) || [];

    this.imagenesAEliminar = [];
    this.isEditMode = true;
    this.showModal = true;
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    Array.from(files).forEach((file, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenes.push({
          imagen: file,
          previewUrl: reader.result,
          orden: this.imagenes.length,
          file_key: `imagen_${this.imagenes.length}`
        });
      };
      reader.readAsDataURL(file);
    });
    this.fileInput.nativeElement.value = '';
  }

  marcarImagenParaEliminar(img: ImagenProducto) {
    if (img.id) {
      this.imagenesAEliminar.push(img.id);
      this.imagenes = this.imagenes.filter(i => i !== img);
    }
  }

  removeNewImage(img: ImagenProducto) {
    this.imagenes = this.imagenes.filter(i => i !== img);
  }

  saveProducto() {
    const formData = new FormData();
    formData.append('nombre', this.selectedProducto.nombre);
    formData.append('descripcion', this.selectedProducto.descripcion || '');
    formData.append('precio_unitario', this.selectedProducto.precio_unitario.toString());
    formData.append('unidad_medida', this.selectedProducto.unidad_medida);
    formData.append('subcategoria', String(this.selectedProducto.subcategoria));
    formData.append('marca', String(this.selectedProducto.marca));
    formData.append('estado', String(this.selectedProducto.estado));
    formData.append('precio_compra', this.selectedProducto.precio_compra.toString());


    const imagenesMeta: { descripcion: string; orden: number; file_key: string }[] = [];

    this.imagenes.forEach((img, index) => {
      if (img.imagen instanceof File) {
        const fileKey = `imagen_${index}`;
        formData.append(fileKey, img.imagen);
        imagenesMeta.push({
          descripcion: img.descripcion || '',
          orden: img.orden ?? index,
          file_key: fileKey
        });
      }
    });

    formData.append('imagenes_meta', JSON.stringify(imagenesMeta));

    if (this.imagenesAEliminar.length > 0) {
      formData.append('imagenes_eliminadas', JSON.stringify(this.imagenesAEliminar));
    }

    const url = this.isEditMode
      ? `http://137.184.94.190/api/productos/${this.selectedProducto.id}/`
      : 'http://137.184.94.190/api/productos/';

    const request = this.isEditMode
      ? this.http.patch(url, formData)
      : this.http.post(url, formData);

    this.isSaving = true;

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', `Producto ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`, 'success');
        this.loadProductos();
        this.closeModal();
        this.isSaving = false;
      },
      error: error => {
        this.isSaving = false;
        const errores = this.formatErrors(error?.error);
        Swal.fire('Error al guardar', errores, 'error');
      }
    });
  }

  deleteProducto(id: number) {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/productos/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El producto fue eliminado.', 'success');
            this.loadProductos();
          },
          error: err => this.handleHttpError(err)
        });
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedProducto = this.getEmptyProducto();
    this.imagenes = [];
    this.imagenesAEliminar = [];
  }

  getSubcategoriaNombre(sub: number | Subcategoria | null): string {
    if (!sub) return 'Sin subcategoría';
    if (typeof sub === 'object') return sub.nombre;
    const subObj = this.subcategorias.find(s => s.id === sub);
    return subObj ? subObj.nombre : 'Sin subcategoría';
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
