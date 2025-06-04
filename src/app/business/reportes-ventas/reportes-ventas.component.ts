import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Cliente {
  id: number;
  first_name: string;
  last_name: string;
  ci: string;
}

@Component({
  selector: 'app-reportes-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes-ventas.component.html',
  styleUrls: ['./reportes-ventas.component.css']
})
export class ReportesVentasComponent implements OnInit {
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  clienteId: number | null = null;

  filtroCliente = '';
  clientesFiltrados: Cliente[] = [];
  timeout: any = null;

  formato: 'pdf' | 'excel' = 'pdf';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  buscarClientePorTexto() {
    clearTimeout(this.timeout);

    if (!this.filtroCliente.trim()) {
      this.clientesFiltrados = [];
      return;
    }

    this.timeout = setTimeout(() => {
      this.http.get<Cliente[]>('http://137.184.94.190/api/usuarios/', {
        params: new HttpParams().set('busqueda', this.filtroCliente)
      }).subscribe({
        next: (res) => this.clientesFiltrados = res,
        error: (err) => {
          console.error('Error al buscar clientes:', err);
          Swal.fire('Error', 'No se pudieron buscar clientes.', 'error');
        }
      });
    }, 400);
  }

  seleccionarCliente(cliente: Cliente) {
    this.clienteId = cliente.id;
    this.filtroCliente = `${cliente.first_name} ${cliente.last_name} - ${cliente.ci}`;
    this.clientesFiltrados = [];
  }

  generarReporte() {
    const params = new HttpParams()
      .set('fecha_inicio', this.fechaInicio || '')
      .set('fecha_fin', this.fechaFin || '')
      .set('cliente', this.clienteId?.toString() || '');

    // ✅ Mostrar los valores antes de hacer la solicitud
    console.log('🔍 Parámetros enviados:', {
      fecha_inicio: this.fechaInicio,
      fecha_fin: this.fechaFin,
      cliente: this.clienteId
    });

    const endpoint = this.formato === 'pdf'
      ? 'http://137.184.94.190/api/reportes/ventas-por-fecha/pdf/'
      : 'http://137.184.94.190/api/reportes/ventas-por-fecha/excel/';

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
        a.download = this.formato === 'pdf' ? 'reporte.pdf' : 'reporte.xlsx';
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
