import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.component.html',
  styleUrls: ['./asistencia.component.css']
})
export class AsistenciaComponent implements OnInit {
  cursos: any[] = [];
  materias: any[] = [];
  alumnos: any[] = [];
  periodos: any[] = [];
  periodoSeleccionadoId: number | null = null;
  isLoadingPeriodos = false;
  cursoSeleccionadoId: number | null = null;
  materiaSeleccionadaId: number | null = null;
  alumnoSeleccionadoId: number | null = null;
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  formatoSeleccionado: 'pdf' | 'excel' | null = null;

  isLoadingCursos = false;
  isLoadingMaterias = false;
  isLoadingAlumnos = false;

  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPeriodos();
    this.cargarCursos();
  }


  cargarCursos(): void {
    this.isLoadingCursos = true;
    this.http.get<any[]>(`${this.baseUrl}/cursos/`)
      .subscribe({
        next: data => this.cursos = data,
        error: err => this.handleHttpError(err, 'Error al cargar cursos'),
        complete: () => this.isLoadingCursos = false
      });
  }
  cargarPeriodos(): void {
    this.isLoadingPeriodos = true;
    this.http.get<any[]>(`${this.baseUrl}/periodos/`).subscribe({
      next: data => {
        this.periodos = data;
        const activo = this.periodos.find(p => p.activo);
        this.periodoSeleccionadoId = activo ? activo.id : null;
      },
      error: err => this.handleHttpError(err, 'Error al cargar periodos'),
      complete: () => this.isLoadingPeriodos = false
    });
  }


  onCursoSeleccionado(): void {
    if (!this.cursoSeleccionadoId || !this.periodoSeleccionadoId) return;

    this.materias = [];
    this.materiaSeleccionadaId = null;
    this.alumnos = [];

    this.isLoadingMaterias = true;
    this.http.get<any[]>(
      `${this.baseUrl}/materias/por-curso/?curso=${this.cursoSeleccionadoId}&periodo=${this.periodoSeleccionadoId}`
    ).subscribe({
      next: data => this.materias = data,
      error: err => this.handleHttpError(err, 'Error al cargar materias'),
      complete: () => this.isLoadingMaterias = false
    });
  }


  onMateriaSeleccionada(): void {
    if (!this.materiaSeleccionadaId || !this.cursoSeleccionadoId) return;

    this.alumnos = [];
    this.alumnoSeleccionadoId = null;
    this.isLoadingAlumnos = true;

    this.http.get<any>(`${this.baseUrl}/usuarios/alumnos-por-curso-materia/?curso=${this.cursoSeleccionadoId}&materia=${this.materiaSeleccionadaId}`)
      .subscribe({
        next: data => this.alumnos = data.results || data,
        error: err => this.handleHttpError(err, 'Error al cargar alumnos'),
        complete: () => this.isLoadingAlumnos = false
      });
  }

  filtrarReporte(): void {
    if (!this.cursoSeleccionadoId || !this.materiaSeleccionadaId || !this.formatoSeleccionado) {
      Swal.fire('Campos obligatorios faltantes', 'Selecciona curso, materia y formato para continuar.', 'warning');
      return;
    }

    const params: any = {
      curso: this.cursoSeleccionadoId,
      materia: this.materiaSeleccionadaId
    };

    if (this.alumnoSeleccionadoId) {
      params.alumno = this.alumnoSeleccionadoId;
    }

    if (this.fechaInicio) {
      params.fecha_inicio = this.fechaInicio;
    }

    if (this.fechaFin) {
      params.fecha_fin = this.fechaFin;
    }

    const endpoint = `${this.baseUrl}/reportes/reporte-asistencia/${this.formatoSeleccionado}/`;

    this.http.get(endpoint, {
      params,
      responseType: 'blob'
    }).subscribe({
      next: res => {
        const blob = new Blob([res], {
          type: this.formatoSeleccionado === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/pdf'
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_asistencia.${this.formatoSeleccionado === 'excel' ? 'xlsx' : 'pdf'}`;
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('✅ Reporte descargado correctamente');
      },
      error: err => this.handleHttpError(err, 'Error al generar el reporte')
    });
  }

  private handleHttpError(error: any, titulo: string): void {
    console.error('HTTP Error:', error);
    const errores = this.formatErrors(error?.error);
    Swal.fire(titulo, errores, 'error');
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
