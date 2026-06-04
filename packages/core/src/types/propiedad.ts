export type TipoOperacion = "venta" | "alquiler" | "venta-alquiler";

export type TipoInmueble =
  | "casa"
  | "departamento"
  | "duplex"
  | "local-comercial"
  | "oficina"
  | "terreno"
  | "campo"
  | "galpon"
  | "cochera"
  | "otro";

export type EstadoPropiedad =
  | "disponible"
  | "reservado"
  | "vendido"
  | "alquilado"
  | "pausado";

export interface PropiedadFrontmatter {
  id: string;
  fecha_carga: string;
  tipo_operacion: TipoOperacion;
  tipo_inmueble: TipoInmueble;
  estado: EstadoPropiedad;
  direccion: string;
  zona: string;
  ciudad: string;
  precio: number;
  moneda: "ARS" | "USD" | "EUR";
  precio_negociable: boolean;
  superficie_total_m2?: number;
  superficie_cubierta_m2?: number;
  ambientes?: number;
  dormitorios?: number;
  banos?: number;
  cocheras?: number;
  antiguedad_anos?: number;
  piso?: string;
  expensas_ars?: number;
  fotos: string[];
  destacadas: string[];
}

export interface PropiedadBody {
  descripcion: string;
  caracteristicas: string;
  entorno: string;
  notas_internas: string;
}

export interface Propiedad extends PropiedadFrontmatter, PropiedadBody {
  filePath: string;
}

export interface PropiedadSummary {
  id: string;
  tipo_operacion: TipoOperacion;
  tipo_inmueble: TipoInmueble;
  estado: EstadoPropiedad;
  direccion: string;
  zona: string;
  precio: number;
  moneda: "ARS" | "USD" | "EUR";
}
