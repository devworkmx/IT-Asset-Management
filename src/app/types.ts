export type AssetType = 'PC' | 'Impresora' | 'Switch' | 'Router' | 'Servidor' | 'Otro';

export type AssetStatus = 'Activo' | 'Inactivo' | 'Mantenimiento' | 'Fuera de Servicio';

export type MaintenanceType = 'Preventivo' | 'Correctivo';

export interface MaintenanceRecord {
  id: string;
  fecha: string;
  tipo: MaintenanceType;
  problema: string;
  solucion: string;
  tecnico: string;
}

export interface Asset {
  id: string;
  nombre: string;
  tipo: AssetType;
  ip: string;
  mac: string;
  nivel: string;
  ubicacion: string;
  estado: AssetStatus;
  marca?: string;
  modelo?: string;
  numeroSerie?: string;
  fechaAdquisicion?: string;
  garantiaHasta?: string;
  notas?: string;
  ultimoMantenimiento?: string;
  historialMantenimiento?: MaintenanceRecord[];
}