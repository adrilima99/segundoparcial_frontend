import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-horario-calendario',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './horario.component.html',
  styleUrls: ['./horario.component.css']
})
export class HorarioComponent implements OnInit {
  eventos: EventInput[] = [];
  isLoading = false;
  readonly apiUrl = 'http://localhost:8000/api/horarios/';




  mostrarFormulario = false;
  mostrarCalendario = false; // NUEVO
  nuevoHorario = {
    dia: null,
    bloque_id: null,
    curso_id: null,
    materia_id: null,
    profesor_id: null,
    periodo_id: null
  };

  bloques: any[] = [];
  cursos: any[] = [];
  materias: any[] = [];
  profesores: any[] = [];
  periodos: any[] = [];
  horariosAgrupados: any[] = [];
  profesorSeleccionado: any = null;

  fechaBaseCalendario: Date = new Date(); // se actualiza dinámicamente

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    events: [],
    locale: 'es',
    height: 'auto',
    eventColor: '#7c3aed',
    editable: false,
    datesSet: (info) => {
      this.fechaBaseCalendario = new Date(info.start); // ✅ se actualiza al navegar
      if (this.profesorSeleccionado) {
        this.loadEventos(this.profesorSeleccionado.horarios);
      }
    }
  };


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerHorariosAgrupadosPorProfesor();
  }

  loadEventos(horarios: any[]) {
    this.eventos = horarios.map((item: any) => this.convertirAHorarioEvent(item));
    // Solo actualizar el campo events
    this.calendarOptions.events = this.eventos;
  }


  obtenerHorariosAgrupadosPorProfesor() {
    const url = this.apiUrl + 'por-todos-los-profesores/';
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.horariosAgrupados = data;
        console.log(this.horariosAgrupados);
      },
      error: (error) => {
        console.error('Error al obtener horarios agrupados:', error);
      }
    });
  }

  verCalendario(profesor: any) {
    this.profesorSeleccionado = profesor;
    this.loadEventos(profesor.horarios);
    this.mostrarCalendario = true;
  }

  cerrarCalendario() {
    this.profesorSeleccionado = null;
    this.mostrarCalendario = false;
  }
  getFechaPorDiaSemana(dia: string, baseDate: Date): string {
    const dayMap: Record<string, number> = {
      'LUNES': 1,
      'MARTES': 2,
      'MIERCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5
    };

    const objetivo = dayMap[dia.toUpperCase()];
    const base = new Date(baseDate);
    const baseDia = base.getDay();

    // Ajustamos (domingo es 0)
    const offset = (objetivo + 7 - (baseDia === 0 ? 7 : baseDia)) % 7;
    base.setDate(base.getDate() + offset);

    return base.toISOString().split('T')[0]; // yyyy-mm-dd
  }


  convertirAHorarioEvent(item: any): EventInput {
    const fechaBase = this.fechaBaseCalendario || new Date();

    const start = `${this.getFechaPorDiaSemana(item.dia, fechaBase)}T${item.bloque_hora_inicio}`;
    const end = `${this.getFechaPorDiaSemana(item.dia, fechaBase)}T${item.bloque_hora_fin}`;

    const event = {
      id: item.id?.toString(),
      title: `${item.curso_nombre} | ${item.materia_nombre}`,
      start,
      end,
      backgroundColor: '#7c3aed',
      extendedProps: {
        curso: item.curso_nombre
      }
    };

    return event;
  }







  mostrarEdicion = false;
  horariosEditar: any[] = [];

  editarHorarios(profesor: any) {
    if (!profesor?.id) {
      console.error("⚠️ Error: El profesor no tiene ID definido.");
      return;
    }

    this.profesorSeleccionado = profesor;
    const url = `${this.apiUrl}por-profesor/?profesor_id=${profesor.id}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        console.log('Horarios obtenidos para edición:', data);
        this.horariosEditar = data;
        this.mostrarEdicion = true;
        this.cargarDatosAuxiliares();
      },
      error: (err) => {
        console.error('Error al obtener horarios del profesor:', err);
      }
    });
  }



  cerrarEdicion() {
    this.profesorSeleccionado = null;
    this.horariosEditar = [];
    this.mostrarEdicion = false;
  }

  actualizarHorario(item: any) {
    const url = `${this.apiUrl}${item.id}/`;
    this.http.put(url, item).subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Horario actualizado correctamente', 'success');
        this.obtenerHorariosAgrupadosPorProfesor();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el horario', 'error');
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.cargarDatosAuxiliares();
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.nuevoHorario = {
      dia: null,
      bloque_id: null,
      curso_id: null,
      materia_id: null,
      profesor_id: null,
      periodo_id: null
    };
  }

  cargarDatosAuxiliares() {
    this.http.get('http://localhost:8000/api/bloques-horarios/').subscribe(data => this.bloques = data as any[]);
    this.http.get('http://localhost:8000/api/cursos/').subscribe(data => this.cursos = data as any[]);
    this.http.get('http://localhost:8000/api/materias/').subscribe(data => this.materias = data as any[]);
    this.http.get('http://localhost:8000/api/usuarios/?rol=Profesor').subscribe(data => this.profesores = data as any[]);
    this.http.get('http://localhost:8000/api/periodos/').subscribe(data => this.periodos = data as any[]);
  }

  crearHorario() {
    const payload = {
      dia: this.nuevoHorario.dia,
      bloque_id: this.nuevoHorario.bloque_id,
      curso_id: this.nuevoHorario.curso_id,
      materia_id: this.nuevoHorario.materia_id,
      profesor_id: this.nuevoHorario.profesor_id,
      periodo_id: this.nuevoHorario.periodo_id
    };

    console.log(payload);

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.cerrarFormulario();
        this.obtenerHorariosAgrupadosPorProfesor();
        Swal.fire('Horario creado', 'Se registró correctamente.', 'success');
      },
      error: (error) => {
        console.error(error);
        Swal.fire('Error', 'No se pudo crear el horario.', 'error');
      }
    });
  }
  eliminarHorario(id: number) {
    Swal.fire({
      title: '¿Eliminar horario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}${id}/`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El horario fue eliminado correctamente.', 'success');
            this.horariosEditar = this.horariosEditar.filter(h => h.id !== id);
            this.obtenerHorariosAgrupadosPorProfesor();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el horario.', 'error');
          }
        });
      }
    });
  }

}
