import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Rol {
  id: number;
  name: string;
  permissions: number[];
}

interface Permiso {
  id: number;
  name: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  filteredRoles: Rol[] = [];
  permisosDisponibles: Permiso[] = [];
  selectedRol: Rol = this.getEmptyRol();

  showModal = false;
  isLoading = false;
  isSaving = false;

  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermisos();
  }

  getEmptyRol(): Rol {
    return {
      id: 0,
      name: '',
      permissions: []
    };
  }

  loadRoles() {
    this.isLoading = true;
    this.http.get<Rol[]>('http://localhost:8000/api/roles/').subscribe({
      next: data => {
        this.roles = data;
        this.filterRoles();
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.handleHttpError(err);
      }
    });
  }

  loadPermisos() {
    this.http.get<Permiso[]>('http://localhost:8000/api/permisos/').subscribe({
      next: data => this.permisosDisponibles = data,
      error: err => this.handleHttpError(err)
    });
  }

  filterRoles() {
    const term = this.searchTerm.toLowerCase();
    this.filteredRoles = this.roles.filter(rol =>
      rol.name.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  paginatedRoles(): Rol[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.filteredRoles.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  addRol() {
    this.selectedRol = this.getEmptyRol();
    this.showModal = true;
  }

  editRol(rol: Rol) {
    this.selectedRol = { ...rol };
    this.showModal = true;
  }

  togglePermiso(id: number) {
    const index = this.selectedRol.permissions.indexOf(id);
    if (index > -1) {
      this.selectedRol.permissions.splice(index, 1);
    } else {
      this.selectedRol.permissions.push(id);
    }
  }

  getNombrePermiso(id: number): string {
    const permiso = this.permisosDisponibles.find(p => p.id === id);
    return permiso ? permiso.name : `#${id}`;
  }


  permisoSeleccionado(id: number): boolean {
    return this.selectedRol.permissions.includes(id);
  }

  closeModal() {
    this.showModal = false;
    this.selectedRol = this.getEmptyRol();
  }

  saveRol() {
    const url = 'http://localhost:8000/api/roles/';
    const payload = {
      name: this.selectedRol.name,
      permissions: this.selectedRol.permissions
    };

    const request = this.selectedRol.id
      ? this.http.put(`${url}${this.selectedRol.id}/`, payload)
      : this.http.post(url, payload);

    this.isSaving = true;
    request.subscribe({
      next: () => {
        Swal.fire('Guardado', 'Rol actualizado correctamente.', 'success');
        this.loadRoles();
        this.closeModal();
        this.isSaving = false;
      },
      error: error => {
        this.isSaving = false;
        const errores = this.formatErrors(error?.error);
        Swal.fire('Error al guardar', errores, 'error');
      }
    });
  }

  private handleHttpError(error: any) {
    console.error('HTTP Error:', error);
    const errores = this.formatErrors(error?.error);
    Swal.fire('Error', errores, 'error');
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
