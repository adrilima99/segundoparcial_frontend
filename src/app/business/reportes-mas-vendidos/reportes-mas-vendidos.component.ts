import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Categoria { id: number; nombre: string; }
interface Subcategoria { id: number; nombre: string; }
interface Marca { id: number; nombre: string; }

@Component({
  selector: 'app-reportes-mas-vendidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-mas-vendidos.component.html',
  styleUrls: ['./reportes-mas-vendidos.component.css']
})
export class ReportesMasVendidosComponent implements OnInit {
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  categoriaId: number | null = null;
  subcategoriaId: number | null = null;
  marcaId: number | null = null;

  categorias: Categoria[] = [];
  subcategorias: Subcategoria[] = [];
  marcas: Marca[] = [];

  formato: 'pdf' | 'excel' = 'pdf';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarFiltros();
  }

  cargarFiltros() {
    this.http.get<Categoria[]>('http://137.184.94.190/api/categorias/')
      .subscribe(data => this.categorias = data);

    this.http.get<Marca[]>('http://137.184.94.190/api/marcas/')
      .subscribe(data => this.marcas = data);
  }

  onCategoriaChange() {
    this.subcategoriaId = null;

    if (!this.categoriaId) {
      this.subcategorias = [];
      return;
    }

    this.http.get<Subcategoria[]>(`http://137.184.94.190/api/subcategorias/?categoria=${this.categoriaId}`)
      .subscribe(data => this.subcategorias = data);
  }

  generarReporte() {
    const params = new HttpParams()
      .set('fecha_inicio', this.fechaInicio || '')
      .set('fecha_fin', this.fechaFin || '')
      .set('categoria', this.categoriaId?.toString() || '')
      .set('subcategoria', this.subcategoriaId?.toString() || '')
      .set('marca', this.marcaId?.toString() || '');

    console.log('🔍 Parámetros enviados:', {
      fecha_inicio: this.fechaInicio,
      fecha_fin: this.fechaFin,
      categoria: this.categoriaId,
      subcategoria: this.subcategoriaId,
      marca: this.marcaId
    });

    const endpoint = this.formato === 'pdf'
      ? 'http://137.184.94.190/api/reportes/productos-mas-vendidos/pdf/'
      : 'http://137.184.94.190/api/reportes/productos-mas-vendidos/excel/';

    this.isLoading = true;

    this.http.get(endpoint, {
      params,
      responseType: 'blob'
    }).subscribe({
      next: (data) => {
        const blob = new Blob([data], {
          type: this.formato === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.formato === 'pdf' ? 'mas_vendidos.pdf' : 'mas_vendidos.xlsx';
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
