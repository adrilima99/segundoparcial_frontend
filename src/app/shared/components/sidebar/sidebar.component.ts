import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isAdminOrSuperadmin: boolean = false;
  isVendedor: boolean = false;

  // 👇 Aquí declaras la variable para controlar el submenú de Usuarios
  isUsuariosOpen: boolean = false;
  isProductosOpen = false;
  isVentasOpen = false;
  isReportesOpen = false;
  isInstitucionOpen = false;
  isHorariosOpen = false;

  ngOnInit(): void {
    const userRole = localStorage.getItem('userRole');

    this.isAdminOrSuperadmin = userRole === 'Administrador' || userRole === 'Superadmin';
    this.isVendedor = userRole === 'Vendedor';
  }
}
