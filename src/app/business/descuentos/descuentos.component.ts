import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Producto {
  id: number;
  nombre: string;
  subcategoria: number | Subcategoria;
}

interface Subcategoria {
  id: number;
  nombre: string;
  categoria: number | Categoria;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface CampanaDescuento {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  activa: boolean;
}

interface Descuento {
  id: number;
  producto: Producto;
  porcentaje: number;
  activo: boolean;
  campana: CampanaDescuento;
}

@Component({
  selector: 'app-descuentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.css']
})
export class DescuentosComponent implements OnInit {
  descuentos: Descuento[] = [];
  productos: Producto[] = [];
  subcategorias: Subcategoria[] = [];
  categorias: Categoria[] = [];
  campanas: CampanaDescuento[] = [];

  selectedDescuento: any = this.getEmptyDescuento();
  showModal = false;
  isEditMode = false;
  isLoading = false;
  isSaving = false;

  productoBuscado: string = '';
  mostrarListaProductos = true;

  categoriaSeleccionada: number | null = null;
  subcategoriaSeleccionada: number | null = null;
  campanaSeleccionada: number | CampanaDescuento | null = null;


  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;
  filteredDescuentos: Descuento[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDescuentos();
    this.loadProductos();
    this.loadCategorias();
    this.loadSubcategorias();
    this.loadCampanas();
  }

  getEmptyDescuento() {
    return {
      id: 0,
      producto: null,
      porcentaje: 0,
      activo: true,
      campana: null
    };
  }

  loadDescuentos() {
    this.isLoading = true;
    this.http.get<Descuento[]>('http://137.184.94.190/api/descuentos/').subscribe({
      next: data => {
        this.descuentos = data;
        this.filterDescuentos();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.handleHttpError(err);
      }
    });
  }

  loadProductos() {
    this.http.get<any>('http://137.184.94.190/api/productos/?page=1').subscribe({
      next: data => {
        this.productos = data.results;
        this.filterDescuentos();
      },
      error: err => this.handleHttpError(err)
    });
  }

  loadCategorias() {
    this.http.get<Categoria[]>('http://137.184.94.190/api/categorias/').subscribe(data => this.categorias = data);
  }

  loadSubcategorias() {
    this.http.get<Subcategoria[]>('http://137.184.94.190/api/subcategorias/').subscribe(data => this.subcategorias = data);
  }

  loadCampanas() {
    this.http.get<CampanaDescuento[]>('http://137.184.94.190/api/campanas/').subscribe(data => this.campanas = data);
  }

  getNombreProducto(producto: Producto): string {
    return producto?.nombre || 'Producto no encontrado';
  }

  getNombreSubcategoriaDesdeProducto(producto: Producto): string {
    const subId = typeof producto.subcategoria === 'object' ? producto.subcategoria.id : producto.subcategoria;
    const sub = this.subcategorias.find(s => s.id === subId);
    return sub ? sub.nombre : '—';
  }

  getNombreCategoriaDesdeProducto(producto: Producto): string {
    const subId = typeof producto.subcategoria === 'object' ? producto.subcategoria.id : producto.subcategoria;
    const sub = this.subcategorias.find(s => s.id === subId);
    const catId = typeof sub?.categoria === 'object' ? sub.categoria.id : sub?.categoria;
    const cat = this.categorias.find(c => c.id === catId);
    return cat ? cat.nombre : '—';
  }

  getNombreCampana(campana: CampanaDescuento | null): string {
    return campana?.nombre || '—';
  }

  selectProducto(id: number) {
    const producto = this.productos.find(p => p.id === id);
    this.selectedDescuento.producto = producto || null;
    this.productoBuscado = producto?.nombre || '';
    this.mostrarListaProductos = false;
  }

  getProductosFiltradosPorNombre(): Producto[] {
    const term = this.productoBuscado.toLowerCase();
    return this.productos.filter(p => p.nombre.toLowerCase().includes(term));
  }

  showAddModal() {
    this.selectedDescuento = this.getEmptyDescuento();
    this.productoBuscado = '';
    this.mostrarListaProductos = true;
    this.isEditMode = false;
    this.showModal = true;
  }

  showEditModal(descuento: Descuento) {
    const campanaEncontrada = this.campanas.find(c => c.id === descuento.campana.id);

    this.selectedDescuento = {
      id: descuento.id,
      producto: descuento.producto,
      porcentaje: descuento.porcentaje,
      activo: descuento.activo,
      campana: campanaEncontrada || null
    };

    this.productoBuscado = descuento.producto?.nombre || '';
    this.mostrarListaProductos = false;
    this.isEditMode = true;
    this.showModal = true;
  }


  saveDescuento() {
    if (!this.selectedDescuento.campana || !this.selectedDescuento.producto) {
      Swal.fire('Campos requeridos', 'Debes seleccionar una campaña y un producto.', 'warning');
      return;
    }

    const payload = {
      campana_id: this.selectedDescuento.campana.id,
      producto_id: this.selectedDescuento.producto.id,
      porcentaje: this.selectedDescuento.porcentaje,
      activo: this.selectedDescuento.activo
    };

    console.log('Payload enviado:', payload); // 👈 Aquí se imprime lo que se manda

    this.isSaving = true;

    const request = this.isEditMode
      ? this.http.put(`http://137.184.94.190/api/descuentos/${this.selectedDescuento.id}/`, payload)
      : this.http.post('http://137.184.94.190/api/descuentos/', payload);

    request.subscribe({
      next: () => {
        Swal.fire('Guardado', `Descuento ${this.isEditMode ? 'actualizado' : 'registrado'} correctamente.`, 'success');
        this.loadDescuentos();
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

  deleteDescuento(id: number) {
    Swal.fire({
      title: '¿Eliminar descuento?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/descuentos/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El descuento fue eliminado.', 'success');
            this.loadDescuentos();
          },
          error: err => this.handleHttpError(err)
        });
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedDescuento = this.getEmptyDescuento();
    this.productoBuscado = '';
    this.mostrarListaProductos = true;
  }

  filterDescuentos() {
    this.filteredDescuentos = this.descuentos.filter(descuento => {
      const producto = descuento.producto;
      const subId = typeof producto.subcategoria === 'object' ? producto.subcategoria.id : producto.subcategoria;
      const sub = this.subcategorias.find(s => s.id === subId);
      const catId = typeof sub?.categoria === 'object' ? sub.categoria.id : sub?.categoria;

      const catMatch = !this.categoriaSeleccionada || catId === this.categoriaSeleccionada;
      const subMatch = !this.subcategoriaSeleccionada || sub?.id === this.subcategoriaSeleccionada;
      const campanaMatch = !this.campanaSeleccionada ||
        descuento.campana.id === (typeof this.campanaSeleccionada === 'object'
          ? this.campanaSeleccionada.id
          : this.campanaSeleccionada);
      const textMatch = this.searchTerm.trim() === '' ||
        producto?.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());

      return catMatch && subMatch && campanaMatch && textMatch;
    });

    this.currentPage = 1;
  }


  paginatedDescuentos(): Descuento[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDescuentos.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredDescuentos.length / this.itemsPerPage);
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
