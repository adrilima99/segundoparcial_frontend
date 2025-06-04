import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Categoria { id: number; nombre: string; }
interface Subcategoria { id: number; nombre: string; }
interface Producto { id: number; nombre: string; subcategoria_id?: number; }

@Component({
  selector: 'app-reportes-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-inventario.component.html',
  styleUrls: ['./reportes-inventario.component.css']
})
export class ReportesInventarioComponent implements OnInit {
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  categoriaId: number | null = null;
  subcategoriaId: number | null = null;
  productoId: number | null = null;
  tipo: 'entrada' | 'salida' | null = null;
  formato: 'pdf' | 'excel' = 'pdf';

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  busquedaProducto: string = '';
  mostrarDropdown: boolean = false;
  isLoading = false;

  totalItems = 0;
  currentPage = 1;
  hasNextPage = false;
  hasPrevPage = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarFiltros();
    this.loadProductos();
  }

  cargarFiltros() {
    this.http.get<Categoria[]>('http://137.184.94.190/api/categorias/')
      .subscribe(data => this.categorias = data);
  }

  loadProductos(page: number = 1) {
    this.isLoading = true;
    this.http.get<any>(`http://137.184.94.190/api/productos/?sin_stock=all&page=${page}`).subscribe({
      next: data => {
        this.productos = data.results;
        this.productosFiltrados = data.results;
        this.totalItems = data.count;
        this.hasNextPage = !!data.next;
        this.hasPrevPage = !!data.previous;
        this.currentPage = page;
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
        console.error(error);
      }
    });
  }

  onCategoriaChange() {
    this.subcategoriaId = null;
    this.subcategorias = [];

    if (!this.categoriaId) return;

    this.http.get<Subcategoria[]>(`http://137.184.94.190/api/subcategorias/?categoria=${this.categoriaId}`)
      .subscribe(data => this.subcategorias = data);
  }

  onSubcategoriaChange() {
    this.filtrarProductosPorBusqueda();
  }

  onBuscarProductoChange() {
    this.filtrarProductosPorBusqueda();
    this.mostrarDropdown = true;
  }

  seleccionarProducto(producto: Producto) {
    this.productoId = producto.id;
    this.busquedaProducto = producto.nombre;
    this.mostrarDropdown = false;
  }

  filtrarProductosPorBusqueda() {
    const termino = this.busquedaProducto.toLowerCase();
    this.productosFiltrados = this.productos.filter(prod =>
      prod.nombre.toLowerCase().includes(termino) &&
      (!this.subcategoriaId || prod.subcategoria_id === this.subcategoriaId)
    );
  }

  generarReporte() {
    const params = new HttpParams()
      .set('fecha_inicio', this.fechaInicio || '')
      .set('fecha_fin', this.fechaFin || '')
      .set('categoria', this.categoriaId?.toString() || '')
      .set('subcategoria', this.subcategoriaId?.toString() || '')
      .set('producto', this.productoId?.toString() || '')
      .set('tipo', this.tipo || '');

    const endpoint = this.formato === 'pdf'
      ? 'http://137.184.94.190/api/reportes/inventario/pdf/'
      : 'http://137.184.94.190/api/reportes/inventario/excel/';

    this.isLoading = true;

    this.http.get(endpoint, { params, responseType: 'blob' }).subscribe({
      next: (data) => {
        const blob = new Blob([data], {
          type: this.formato === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.formato === 'pdf'
          ? 'reporte_inventario.pdf'
          : 'reporte_inventario.xlsx';
        a.click();

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudo generar el reporte.', 'error');
        console.error(err);
      }
    });
  }
}
