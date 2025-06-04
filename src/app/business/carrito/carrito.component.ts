import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Producto {
  id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface Carrito {
  id: number;
  usuario_nombre: string;
  estado: string;
  total_estimado: number;
  fecha_actualizacion: string;
  items: { producto: Producto; cantidad: number }[];
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carritos: Carrito[] = [];
  carritosFiltrados: Carrito[] = [];

  isLoading = false;
  showProductosModal = false;
  productosDelCarrito: { producto: Producto; cantidad: number }[] = [];

  filtroUsuario: string = '';
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerCarritos();
  }

  obtenerCarritos() {
    this.isLoading = true;
    this.http.get<Carrito[]>('http://137.184.94.190/api/carritos/todos/').subscribe({
      next: data => {
        this.carritos = data;
        this.filtrarCarritos();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los carritos.', 'error');
        console.error(err);
      }
    });
  }

  filtrarCarritos() {
    const nombre = this.filtroUsuario.toLowerCase();
    const desde = this.filtroFechaInicio ? new Date(this.filtroFechaInicio) : null;
    const hasta = this.filtroFechaFin ? new Date(this.filtroFechaFin) : null;

    this.carritosFiltrados = this.carritos.filter(c => {
      const nombreMatch = c.usuario_nombre.toLowerCase().includes(nombre);
      const fecha = new Date(c.fecha_actualizacion);
      const fechaDesdeOK = !desde || fecha >= desde;
      const fechaHastaOK = !hasta || fecha <= hasta;
      return nombreMatch && fechaDesdeOK && fechaHastaOK;
    });
  }

  verProductos(carrito: Carrito) {
    this.productosDelCarrito = carrito.items;
    this.showProductosModal = true;
  }

  cerrarModal() {
    this.showProductosModal = false;
    this.productosDelCarrito = [];
  }

  eliminarCarrito(id: number) {
    Swal.fire({
      title: '¿Eliminar carrito?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://137.184.94.190/api/carritos/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El carrito fue eliminado correctamente.', 'success');
            this.obtenerCarritos();
          },
          error: err => {
            Swal.fire('Error', 'No se pudo eliminar el carrito.', 'error');
            console.error(err);
          }
        });
      }
    });
  }
}
