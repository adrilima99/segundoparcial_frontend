import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./shared/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'colegio',
        loadComponent: () => import('./business/institucion/colegio.component').then(m => m.ColegioComponent),
      },
      {
        path: 'niveles',
        loadComponent: () => import('./business/niveles/niveles.component').then(m => m.NivelesComponent),
      },
      {
        path: 'gestiones',
        loadComponent: () => import('./business/gestiones/gestiones.component').then(m => m.GestionesComponent),
      },
      {
        path: 'turnos',
        loadComponent: () => import('./business/turnos/turnos.component').then(m => m.TurnosComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./business/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'periodos',
        loadComponent: () => import('./business/periodos/periodos.component').then(m => m.PeriodosComponent),
      },
      {
        path: 'materias',
        loadComponent: () => import('./business/materias/materias.component').then(m => m.MateriasComponent),
      },
      {
        path: 'cursos',
        loadComponent: () => import('./business/cursos/cursos.component').then(m => m.CursosComponent),
      },
      {
        path: 'bloques-horario',
        loadComponent: () => import('./business/bloque-horario/bloque-horario.component').then(m => m.BloqueHorarioComponent),
      },
      {
        path: 'especialidades',
        loadComponent: () => import('./business/especialidades/especialidades.component').then(m => m.EspecialidadesComponent),
      },
      {
        path: 'alumnos',
        loadComponent: () => import('./business/alumnos/alumnos.component').then(m => m.AlumnosComponent),
      },
      {
        path: 'horarios',
        loadComponent: () => import('./business/horario/horario.component').then(m => m.HorarioComponent),
      },
      {
        path: 'roles',
        loadComponent: () => import('./business/roles/roles.component').then(m => m.RolesComponent),
      },
      {
        path: 'bitacoras',
        loadComponent: () => import('./business/bitacora/bitacora.component').then(m => m.BitacoraComponent),
      },
      {
        path: 'reportes/asistencia',
        loadComponent: () => import('./business/reportes/asistencia/asistencia.component').then(m => m.AsistenciaComponent),
      },
      {
        path: 'reportes/licencias',
        loadComponent: () => import('./business/reportes/licencias/licencias.component').then(m => m.LicenciasComponent),
      },
      {
        path: 'reportes/rendimiento',
        loadComponent: () => import('./business/reportes/rendimiento/rendimiento.component').then(m => m.RendimientoComponent),
      },
      {
        path: 'reportes/participacion',
        loadComponent: () => import('./business/reportes/participacion/participacion.component').then(m => m.ParticipacionComponent),
      },
      {
        path: 'categorias',
        loadComponent: () => import('./business/categorias/categorias.component').then(m => m.CategoriasComponent),
      },
      {
        path: 'subcategorias',
        loadComponent: () => import('./business/subcategorias/subcategorias.component').then(m => m.SubcategoriasComponent),
      },
      {
        path: 'marcas',
        loadComponent: () => import('./business/marcas/marcas.component').then(m => m.MarcasComponent),
      },
      {
        path: 'campanas',
        loadComponent: () => import('./business/campanas/campanas.component').then(m => m.CampanasComponent),
      },
      {
        path: 'descuentos',
        loadComponent: () => import('./business/descuentos/descuentos.component').then(m => m.DescuentosComponent),
      },
      {
        path: 'carrito',
        loadComponent: () => import('./business/carrito/carrito.component').then(m => m.CarritoComponent),
      },
      {
        path: 'ventas',
        loadComponent: () => import('./business/ventas/ventas.component').then(m => m.VentasComponent),
      },
      {
        path: 'facturas',
        loadComponent: () => import('./business/facturas/facturas.component').then(m => m.FacturasComponent),
      },
      {
        path: 'tipos-pago',
        loadComponent: () => import('./business/tipos-pago/tipos-pago.component').then(m => m.TiposPagoComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./business/productos/productos.component').then(m => m.ProductoComponent),
      },
      {
        path: 'stock',
        loadComponent: () => import('./business/stock/stock.component').then(m => m.StockComponent),
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./business/movimientos-inventario/movimientos-inventario.component').then(m => m.MovimientoInventarioComponent),
      },
      {
        path: 'reportes/ventas',
        loadComponent: () => import('./business/reportes-ventas/reportes-ventas.component').then(m => m.ReportesVentasComponent),
      },
      {
        path: 'reportes/mas-vendidos',
        loadComponent: () => import('./business/reportes-mas-vendidos/reportes-mas-vendidos.component').then(m => m.ReportesMasVendidosComponent),
      },
      {
        path: 'reportes/inventario',
        loadComponent: () => import('./business/reportes-inventario/reportes-inventario.component').then(m => m.ReportesInventarioComponent),
      },
    ]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '**',
    redirectTo: ''
  }
];
