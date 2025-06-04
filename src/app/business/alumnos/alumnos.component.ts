import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Alumno {
  id: number;
  first_name: string;
  last_name: string;
  ci: string;
  celular: string;
  tutor_nombre: string;
  tutor_celular: string;
  curso: number;
  curso_nombre?: string;
  username?: string;
  email?: string;
  foto_perfil?: string; // ← URL que llega del backend
}


interface Curso {
  id: number;
  nombre: string;
  nivel_nombre: string;
}

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  alumnos: Alumno[] = [];
  errores: any[] = [];
  archivoSeleccionado: File | null = null;
  isLoading = false;
  cursoSeleccionadoParaImportar: number | null = null;
  showImportModal = false;


  showModal = false;
  isEditMode = false;
  selectedAlumno: Alumno = {} as Alumno;
  fotoSeleccionada: File | null = null;
  alumnosFiltrados: Alumno[] = [];

  cursos: Curso[] = [];
  cursoSeleccionado: string = 'todos';
  searchTerm: string = '';

  readonly importarUrl = 'http://localhost:8000/api/usuarios/importar-alumnos/';
  readonly alumnosPorCursoUrl = 'http://localhost:8000/api/usuarios/alumnos-por-curso/';
  readonly cursosUrl = 'http://localhost:8000/api/cursos/';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarAlumnos();
  }

  cargarCursos(): void {
    this.http.get<Curso[]>(this.cursosUrl).subscribe({
      next: res => this.cursos = res,
      error: err => console.error('❌ Error al cargar cursos', err)
    });
  }

  abrirModalImportar(): void {
    this.showImportModal = true;
  }

  cerrarModalImportar(): void {
    this.showImportModal = false;
    this.archivoSeleccionado = null;
    this.cursoSeleccionadoParaImportar = null;
  }


  onFotoSeleccionada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoSeleccionada = file;

      // Previsualización rápida (opcional)
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedAlumno.foto_perfil = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }



  cargarAlumnos(): void {
    this.isLoading = true;
    let url = this.alumnosPorCursoUrl;
    if (this.cursoSeleccionado !== 'todos') {
      url += `?curso=${this.cursoSeleccionado}`;
    }

    this.http.get<{ results: Alumno[] }>(url).subscribe({
      next: res => {
        console.log('✅ Datos de alumnos recibidos:', res.results);
        this.alumnos = res.results;
        this.filtrar();  // ← aplica filtro local a los datos ya cargados
        this.isLoading = false;
      },
      error: err => {
        console.error('❌ Error al cargar alumnos', err);
        this.isLoading = false;
      }
    });
  }


  aplicarFiltro(alumnos: Alumno[]): Alumno[] {
    const term = this.searchTerm.toLowerCase();
    return alumnos.filter(alumno =>
      alumno.first_name.toLowerCase().includes(term) ||
      alumno.last_name.toLowerCase().includes(term)
    );
  }

  filtrar(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.alumnosFiltrados = [...this.alumnos];
    } else {
      this.alumnosFiltrados = this.alumnos.filter(alumno =>
        alumno.first_name.toLowerCase().includes(term) ||
        alumno.last_name.toLowerCase().includes(term) ||
        alumno.ci.toLowerCase().includes(term) ||
        alumno.tutor_nombre.toLowerCase().includes(term)
      );
    }
  }


  seleccionarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      this.archivoSeleccionado = archivo;
    }
  }

  importarAlumnos(): void {
    if (!this.archivoSeleccionado) {
      Swal.fire('Archivo requerido', 'Debes seleccionar un archivo Excel.', 'warning');
      return;
    }
    if (!this.cursoSeleccionadoParaImportar) {
      Swal.fire('Curso requerido', 'Debes seleccionar un curso para importar alumnos.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('curso', this.cursoSeleccionadoParaImportar.toString());

    this.isLoading = true;

    this.http.post<any>(this.importarUrl, formData).subscribe({
      next: res => {
        Swal.fire('Importación exitosa', res.mensaje, 'success');
        this.errores = res.errores || [];
        this.cargarAlumnos();
        this.archivoSeleccionado = null;
        this.isLoading = false;
        this.cerrarModalImportar();
      },
      error: err => {
        console.error('❌ Error al importar alumnos', err);
        Swal.fire('Error', 'No se pudo importar el archivo.', 'error');
        this.isLoading = false;
      }
    });
  }
  editarAlumno(alumno: Alumno): void {
    this.selectedAlumno = { ...alumno };
    this.isEditMode = true;
    this.showModal = true;
  }

  eliminarAlumno(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al alumno de forma permanente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:8000/api/usuarios/${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El alumno ha sido eliminado correctamente.', 'success');
            this.cargarAlumnos();
          },
          error: err => {
            console.error('❌ Error al eliminar alumno:', err);
            Swal.fire('Error', 'No se pudo eliminar el alumno.', 'error');
          }
        });
      }
    });
  }



  cerrarModal(): void {
    this.showModal = false;
    this.selectedAlumno = {} as Alumno;
    this.fotoSeleccionada = null;
  }


  guardarAlumno(): void {
    console.log('📤 Enviando datos del alumno al backend...');
    this.isLoading = true;
    const id = this.selectedAlumno.id;
    const url = `http://localhost:8000/api/usuarios/${id}/`;

    const formData = new FormData();
    formData.append('first_name', this.selectedAlumno.first_name);
    formData.append('last_name', this.selectedAlumno.last_name);
    formData.append('ci', this.selectedAlumno.ci);
    formData.append('celular', this.selectedAlumno.celular);
    formData.append('tutor_nombre', this.selectedAlumno.tutor_nombre);
    formData.append('tutor_celular', this.selectedAlumno.tutor_celular);

    if (this.fotoSeleccionada) {
      formData.append('foto_perfil', this.fotoSeleccionada);
    }
    if (this.selectedAlumno.curso !== undefined && this.selectedAlumno.curso !== null) {
      formData.append('curso', this.selectedAlumno.curso.toString());
    }


    this.http.patch(url, formData).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Alumno editado correctamente.', 'success');
        this.cargarAlumnos();
        this.cerrarModal();
        this.isLoading = false;
        this.fotoSeleccionada = null;
      },
      error: err => {
        console.error('❌ Error al actualizar alumno', err);
        Swal.fire('Error', 'No se pudo actualizar el alumno.', 'error');
        this.isLoading = false;
      }
    });

}



}
