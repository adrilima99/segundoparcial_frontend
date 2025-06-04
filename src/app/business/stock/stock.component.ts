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

interface Stock {
  id: number;
  producto: number;
  cantidad_actual: number;
  punto_reorden: number;
  fecha_actualizacion?: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {
  stocks: Stock[] = [];
  productosConStock: Producto[] = [];
  productosSinStock: Producto[] = [];
  subcategorias: Subcategoria[] = [];
  categorias: Categoria[] = [];

  filteredStocks: Stock[] = [];
  selectedStock: Stock = this.getEmptyStock();

  categoriaSeleccionada: number | null = null;
  subcategoriaSeleccionada: number | null = null;

  showModal = false;
  isLoading = false;
  isSaving = false;

  productoBuscado: string = '';
  mostrarListaProductos: boolean = true;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  productosPage = 1;
  totalProductos = 0;
  hasNextProductosPage = false;
  hasPrevProductosPage = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStocks();
    this.loadProductosTodos();
    this.loadProductosSinStock();
    this.loadCategorias();
    this.loadSubcategorias();
  }

  getEmptyStock(): Stock {
    return {
      id: 0,
      producto: 0,
      cantidad_actual: 0,
      punto_reorden: 5
    };
  }

  loadStocks() {
    this.isLoading = true;
    this.http.get<Stock[]>('http://137.184.94.190/api/stock/').subscribe({
      next: data => {
        this.stocks = data;
        this.filterStocks();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.handleHttpError(err);
      }
    });
  }

  loadProductosSinStock(page: number = 1) {
    this.http.get<any>(`http://137.184.94.190/api/productos/?sin_stock=1&page=${page}`).subscribe({
      next: data => {
        this.productosSinStock = data.results;
        this.totalProductos = data.count;
        this.hasNextProductosPage = !!data.next;
        this.hasPrevProductosPage = !!data.previous;
        this.productosPage = page;
      },
      error: err => this.handleHttpError(err)
    });
  }

  loadProductosTodos(page: number = 1) {
    this.http.get<any>(`http://137.184.94.190/api/productos/?sin_stock=all&page=${page}`).subscribe({
      next: data => {
        this.productosConStock = data.results;
        this.filterStocks(); // actualiza tabla con todos los productos
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
    const prod = this.productosConStock.find(p => p.id === id);
    return prod ? prod.nombre : 'Producto no encontrado';
  }

  getNombreSubcategoriaDesdeProducto(productoId: number): string {
    const producto = this.productosConStock.find(p => p.id === productoId);
    const subId = typeof producto?.subcategoria === 'object' ? producto.subcategoria.id : producto?.subcategoria;
    const sub = this.subcategorias.find(s => s.id === subId);
    return sub ? sub.nombre : '—';
  }

  getNombreCategoriaDesdeProducto(productoId: number): string {
    const producto = this.productosConStock.find(p => p.id === productoId);
    const subId = typeof producto?.subcategoria === 'object' ? producto.subcategoria.id : producto?.subcategoria;
    const sub = this.subcategorias.find(s => s.id === subId);
    const catId = typeof sub?.categoria === 'object' ? sub.categoria.id : sub?.categoria;
    const cat = this.categorias.find(c => c.id === catId);
    return cat ? cat.nombre : '—';
  }

  getSubcategoriasFiltradas(): Subcategoria[] {
    return this.subcategorias.filter(s => !this.categoriaSeleccionada || s.categoria === this.categoriaSeleccionada);
  }

  getProductosFiltradosPorNombre(): Producto[] {
    const term = this.productoBuscado.toLowerCase();
    return this.productosSinStock.filter(p => p.nombre.toLowerCase().includes(term));
  }


  selectProducto(id: number) {
    this.selectedStock.producto = id;
    const producto = this.productosSinStock.find(p => p.id === id);
    this.productoBuscado = producto?.nombre || '';
    this.mostrarListaProductos = false;
  }


  filterStocks() {
    this.filteredStocks = this.stocks.filter(stock => {
      const producto = this.productosConStock.find(p => p.id === stock.producto);
      const subId = typeof producto?.subcategoria === 'object' ? producto.subcategoria.id : producto?.subcategoria;
      const sub = this.subcategorias.find(s => s.id === subId);
      const catId = typeof sub?.categoria === 'object' ? sub.categoria.id : sub?.categoria;

      const catMatch = !this.categoriaSeleccionada || catId === this.categoriaSeleccionada;
      const subMatch = !this.subcategoriaSeleccionada || sub?.id === this.subcategoriaSeleccionada;
      const textMatch = this.searchTerm.trim() === '' || producto?.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());

      return catMatch && subMatch && textMatch;
    });
    this.currentPage = 1;
  }

  paginatedStocks(): Stock[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredStocks.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredStocks.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addStock() {
    this.selectedStock = this.getEmptyStock();
    this.productoBuscado = '';
    this.mostrarListaProductos = true;
    this.showModal = true;
    this.loadProductosSinStock();
  }

  closeModal() {
    this.showModal = false;
    this.selectedStock = this.getEmptyStock();
    this.productoBuscado = '';
    this.mostrarListaProductos = true;
  }

  saveStock() {
    const url = 'http://137.184.94.190/api/stock/';
    const request = this.http.post(url, this.selectedStock);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        Swal.fire('Guardado', 'Stock registrado correctamente.', 'success');
        this.loadStocks();
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
