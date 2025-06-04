import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Producto {
  id: number;
  nombre: string;
  subcategoria: number;
}

interface Subcategoria {
  id: number;
  nombre: string;
  categoria: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface MovimientoInventario {
  id: number;
  producto: number;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  descripcion?: string;
  fecha_movimiento?: string;
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos-inventario.component.html',
  styleUrls: ['./movimientos-inventario.component.css']
})
export class MovimientoInventarioComponent implements OnInit {
  movimientos: MovimientoInventario[] = [];
  productos: Producto[] = [];
  subcategorias: Subcategoria[] = [];
  categorias: Categoria[] = [];

  nuevoMovimiento: MovimientoInventario = this.getEmptyMovimiento();
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  showModal = false;
  isLoading = false;
  isSaving = false;

  productoBuscado: string = '';
  mostrarListaProductos = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMovimientos();
    this.loadProductos();
    this.loadCategorias();
    this.loadSubcategorias();
  }

  getEmptyMovimiento(): MovimientoInventario {
    return {
      id: 0,
      producto: 0,
      tipo: 'entrada',
      cantidad: 0,
      descripcion: ''
    };
  }

  loadMovimientos() {
    this.isLoading = true;
    this.http.get<MovimientoInventario[]>('http://137.184.94.190/api/movimientos/').subscribe({
      next: data => {
        this.movimientos = data;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.handleHttpError(err);
      }
    });
  }

  loadProductos() {
    this.http.get<any>('http://137.184.94.190/api/productos/?sin_stock=all&limit=100').subscribe({
      next: data => {
        this.productos = data.results;
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

  getNombreProducto(id: number): string {
    const prod = this.productos.find(p => p.id === id);
    return prod ? prod.nombre : 'Producto no encontrado';
  }

  getNombreCategoriaDesdeProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    const sub = this.subcategorias.find(s => s.id === producto?.subcategoria);
    const cat = this.categorias.find(c => c.id === sub?.categoria);
    return cat ? cat.nombre : '—';
  }

  getNombreSubcategoriaDesdeProducto(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    const sub = this.subcategorias.find(s => s.id === producto?.subcategoria);
    return sub ? sub.nombre : '—';
  }

  getProductosFiltradosPorNombre(): Producto[] {
    const term = this.productoBuscado.toLowerCase();
    return this.productos.filter(p => p.nombre.toLowerCase().includes(term));
  }

  selectProducto(id: number) {
    this.nuevoMovimiento.producto = id;
    const producto = this.productos.find(p => p.id === id);
    this.productoBuscado = producto?.nombre || '';
    this.mostrarListaProductos = false;
  }

  addMovimiento() {
    this.nuevoMovimiento = this.getEmptyMovimiento();
    this.productoBuscado = '';
    this.mostrarListaProductos = true;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.nuevoMovimiento = this.getEmptyMovimiento();
    this.productoBuscado = '';
    this.mostrarListaProductos = true;
  }

  saveMovimiento() {
    this.isSaving = true;
    this.http.post('http://137.184.94.190/api/movimientos/', this.nuevoMovimiento).subscribe({
      next: () => {
        Swal.fire('Registrado', 'Movimiento creado correctamente.', 'success');
        this.loadMovimientos();
        this.closeModal();
        this.isSaving = false;
      },
      error: err => {
        this.isSaving = false;
        Swal.fire('Error', this.formatErrors(err?.error), 'error');
      }
    });
  }

  filterMovimientos(): MovimientoInventario[] {
    const term = this.searchTerm.toLowerCase();
    return this.movimientos.filter(mov => {
      const nombre = this.getNombreProducto(mov.producto).toLowerCase();
      return nombre.includes(term);
    });
  }

  paginatedMovimientos(): MovimientoInventario[] {
    const filtered = this.filterMovimientos();
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filterMovimientos().length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  private handleHttpError(error: any) {
    console.error('HTTP Error:', error);
    Swal.fire('Error', this.formatErrors(error?.error), 'error');
  }

  private formatErrors(error: any): string {
    if (!error || typeof error !== 'object') return 'Error desconocido';
    return Object.entries(error).map(([campo, detalles]) => {
      if (Array.isArray(detalles)) {
        return `<strong>${campo}:</strong> ${detalles.join(', ')}`;
      } else if (detalles && typeof detalles === 'object') {
        return `<strong>${campo}:</strong><br>` +
          Object.entries(detalles).map(([k, v]) => `→ ${k}: ${v}`).join('<br>');
      }
      return `<strong>${campo}:</strong> ${JSON.stringify(detalles)}`;
    }).join('<br>');
  }
}
