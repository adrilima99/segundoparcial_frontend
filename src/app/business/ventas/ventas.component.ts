import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Producto {
  id: number;
  nombre: string;
}

interface DetalleVenta {
  id: number;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
}

interface Usuario {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Venta {
  id: number;
  usuario: Usuario;
  fecha_venta: string;
  total: string;
  tipo_pago: {
    id: number;
    nombre: string;
  };
  estado: string;
  referencia_pago: string;
  detalles: DetalleVenta[];
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = []; // ✅ lista filtrada
  isLoading = false;
  selectedVenta: Venta | null = null;
  showModal = false;

  filtroNombre = '';
  fechaInicio = '';
  fechaFin = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadVentas();
  }

  loadVentas() {
    this.isLoading = true;

    this.http.get<Venta[]>('http://137.184.94.190/api/ventas/todas/').subscribe(
      data => {
        this.ventas = data;
        this.ventasFiltradas = [...data]; // ✅ al inicio muestra todo
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        this.handleHttpError(error);
      }
    );
  }

  aplicarFiltros() {
    this.ventasFiltradas = this.ventas.filter(venta => {
      const nombreCompleto = `${venta.usuario.first_name} ${venta.usuario.last_name}`.toLowerCase();
      const filtroNombreMatch = this.filtroNombre
        ? nombreCompleto.includes(this.filtroNombre.toLowerCase())
        : true;

      const fechaVenta = new Date(venta.fecha_venta);
      const desdeMatch = this.fechaInicio
        ? fechaVenta >= new Date(this.fechaInicio)
        : true;

      const hastaMatch = this.fechaFin
        ? fechaVenta <= new Date(this.fechaFin)
        : true;

      return filtroNombreMatch && desdeMatch && hastaMatch;
    });
  }

  verDetalles(venta: Venta) {
    this.selectedVenta = venta;
    this.showModal = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.selectedVenta = null;
  }

  private handleHttpError(error: any) {
    console.error('Error al cargar ventas:', error);
    Swal.fire('Error', 'No se pudieron cargar las ventas.', 'error');
  }
}
