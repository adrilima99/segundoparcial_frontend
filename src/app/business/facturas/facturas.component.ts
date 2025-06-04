import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Factura {
  numero_factura: string;
  fecha_emision: string;
  archivo_pdf_url: string;
  enviado_por_correo: boolean;
}

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.css']
})
export class FacturasComponent implements OnInit {
  facturas: Factura[] = [];
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFacturas();
  }

  loadFacturas(): void {
    this.isLoading = true;
    this.http.get<Factura[]>('http://137.184.94.190/api/facturas/').subscribe(
      data => {
        this.facturas = data;
        this.isLoading = false;
      },
      error => {
        this.isLoading = false;
        console.error('Error al cargar facturas:', error);
      }
    );
  }
}
