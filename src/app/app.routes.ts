import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guards';
import { roleGuard } from './guards/role.guards';
import { loginGuard } from './guards/login.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] },
      },
      {
        path: 'colegio',
        loadComponent: () => import('./business/institucion/colegio.component').then(m => m.ColegioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'niveles',
        loadComponent: () => import('./business/niveles/niveles.component').then(m => m.NivelesComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'gestiones',
        loadComponent: () => import('./business/gestiones/gestiones.component').then(m => m.GestionesComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'turnos',
        loadComponent: () => import('./business/turnos/turnos.component').then(m => m.TurnosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./business/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'periodos',
        loadComponent: () => import('./business/periodos/periodos.component').then(m => m.PeriodosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'materias',
        loadComponent: () => import('./business/materias/materias.component').then(m => m.MateriasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'cursos',
        loadComponent: () => import('./business/cursos/cursos.component').then(m => m.CursosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'bloques-horario',
        loadComponent: () => import('./business/bloque-horario/bloque-horario.component').then(m => m.BloqueHorarioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'especialidades',
        loadComponent: () => import('./business/especialidades/especialidades.component').then(m => m.EspecialidadesComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'alumnos',
        loadComponent: () => import('./business/alumnos/alumnos.component').then(m => m.AlumnosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'horarios',
        loadComponent: () => import('./business/horario/horario.component').then(m => m.HorarioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'roles',
        loadComponent: () => import('./business/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'bitacoras',
        loadComponent: () => import('./business/bitacora/bitacora.component').then(m => m.BitacoraComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'reportes/asistencia',
        loadComponent: () => import('./business/reportes/asistencia/asistencia.component').then(m => m.AsistenciaComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'reportes/licencias',
        loadComponent: () => import('./business/reportes/licencias/licencias.component').then(m => m.LicenciasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'reportes/rendimiento',
        loadComponent: () => import('./business/reportes/rendimiento/rendimiento.component').then(m => m.RendimientoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'reportes/participacion',
        loadComponent: () => import('./business/reportes/participacion/participacion.component').then(m => m.ParticipacionComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director'] }
      },
      {
        path: 'categorias',
        loadComponent: () => import('./business/categorias/categorias.component').then(m => m.CategoriasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'subcategorias',
        loadComponent: () => import('./business/subcategorias/subcategorias.component').then(m => m.SubcategoriasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'marcas',
        loadComponent: () => import('./business/marcas/marcas.component').then(m => m.MarcasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'campanas',
        loadComponent: () => import('./business/campanas/campanas.component').then(m => m.CampanasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'descuentos',
        loadComponent: () => import('./business/descuentos/descuentos.component').then(m => m.DescuentosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'carrito',
        loadComponent: () => import('./business/carrito/carrito.component').then(m => m.CarritoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'ventas',
        loadComponent: () => import('./business/ventas/ventas.component').then(m => m.VentasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'facturas',
        loadComponent: () => import('./business/facturas/facturas.component').then(m => m.FacturasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'tipos-pago',
        loadComponent: () => import('./business/tipos-pago/tipos-pago.component').then(m => m.TiposPagoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'productos',
        loadComponent: () => import('./business/productos/productos.component').then(m => m.ProductoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'stock',
        loadComponent: () => import('./business/stock/stock.component').then(m => m.StockComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./business/movimientos-inventario/movimientos-inventario.component').then(m => m.MovimientoInventarioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'tipos-pago',
        loadComponent: () => import('./business/tipos-pago/tipos-pago.component').then(m => m.TiposPagoComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'reportes/ventas',
        loadComponent: () => import('./business/reportes-ventas/reportes-ventas.component').then(m => m.ReportesVentasComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },

      {
        path: 'reportes/mas-vendidos',
        loadComponent: () => import('./business/reportes-mas-vendidos/reportes-mas-vendidos.component').then(m => m.ReportesMasVendidosComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },
      {
        path: 'reportes/inventario',
        loadComponent: () => import('./business/reportes-inventario/reportes-inventario.component').then(m => m.ReportesInventarioComponent),
        canActivate: [roleGuard],
        data: { expectedRoles: ['Administrador', 'Director', 'Vendedor'] }
      },

    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
