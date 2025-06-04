import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-colegio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colegio.component.html',
  styleUrls: ['./colegio.component.css']
})
export class ColegioComponent implements OnInit {
  colegio: any = {
    codigo_sie: '',
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    ubicacion: '',
    logo: null,
    niveles: [],
    director: '',
    director_nombre: ''
  };

  directoresDisponibles: any[] = [];
  logoPreview: string | null = null;
  logoFile: File | null = null;
  modoEdicion = false;
  cargando = true;
  edicionHabilitada = false;
  puedeEditar = false;

  private readonly baseUrl = 'http://localhost:8000/api/colegios/';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const rol = this.authService.getRole();
    this.puedeEditar = rol === 'Administrador' || rol === 'Superadmin';
    this.obtenerColegio();
    if (this.puedeEditar) this.loadDirectoresDisponibles();
  }

  obtenerColegio() {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (resp) => {
        this.cargando = false;
        if (resp.length === 0) {
          Swal.fire({
            title: '¡Atención!',
            text: 'Aún no se ha registrado ningún colegio.',
            icon: 'warning',
            confirmButtonText: 'Registrar Colegio'
          }).then(() => {
            this.modoEdicion = false;
            this.edicionHabilitada = true;
          });
        } else {
          this.colegio = {
            ...resp[0],
            director: resp[0].director ?? null, // 👈 importante
            director_nombre: resp[0].director_nombre || 'Sin asignar'
          };
          this.logoPreview = this.colegio.logo_url;
          this.modoEdicion = true;
          this.edicionHabilitada = false;
        }
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo obtener los datos del colegio.', 'error');
      }
    });
  }

  loadDirectoresDisponibles() {
    this.http.get<any[]>('http://localhost:8000/api/usuarios/directores-disponibles/').subscribe({
      next: data => this.directoresDisponibles = data,
      error: () => Swal.fire('Error', 'No se pudieron obtener los directores disponibles.', 'error')
    });
  }

  activarEdicion() {
    if (this.puedeEditar) {
      this.edicionHabilitada = true;
    }
  }

  cancelarEdicion() {
    this.obtenerColegio();
  }

  onLogoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  abrirSelectorMapa() {
    Swal.fire({
      title: 'Ubicación en Google Maps',
      input: 'textarea',
      inputLabel: 'Pega el iframe completo o solo el src de Google Maps',
      inputPlaceholder: '<iframe src="https://www.google.com/maps/embed?pb=..." ... ></iframe>',
      showCancelButton: true,
      confirmButtonText: 'Guardar'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        let valor = result.value.trim();
        const srcMatch = valor.match(/src="([^"]+)"/);
        if (srcMatch) {
          valor = srcMatch[1];
        }

        if (!valor.includes('maps/embed?pb=')) {
          Swal.fire('Formato inválido', 'Debes pegar el enlace embed (src) de Google Maps.', 'error');
          return;
        }

        this.colegio.ubicacion = valor;
      }
    });
  }

  sanitizarUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  abrirEnMapa() {
    if (this.colegio.ubicacion) {
      window.open(this.colegio.ubicacion, '_blank');
    }
  }

  guardarColegio() {
    const formData = new FormData();
    formData.append('codigo_sie', this.colegio.codigo_sie || '');
    formData.append('nombre', this.colegio.nombre);
    formData.append('direccion', this.colegio.direccion);
    formData.append('telefono', this.colegio.telefono || '');
    formData.append('email', this.colegio.email || '');
    formData.append('ubicacion', this.colegio.ubicacion || '');
    formData.append('director', this.colegio.director || '');

    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }

    if (this.modoEdicion) {
      this.http.put(`${this.baseUrl}${this.colegio.id}/`, formData).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Datos actualizados correctamente', 'success');
          this.edicionHabilitada = false;
          this.obtenerColegio();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar el colegio', 'error')
      });
    } else {
      this.http.post(this.baseUrl, formData).subscribe({
        next: () => {
          Swal.fire('Creado', 'Colegio registrado correctamente', 'success');
          this.modoEdicion = true;
          this.edicionHabilitada = false;
          this.obtenerColegio();
        },
        error: () => Swal.fire('Error', 'No se pudo registrar el colegio', 'error')
      });
    }
  }
}
