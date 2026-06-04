export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "calificado"
  | "derivado-whatsapp"
  | "en-seguimiento"
  | "cerrado-ganado"
  | "cerrado-perdido"
  | "no-califica";

export type LeadPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "web"
  | "otro";

export type LeadInteres =
  | "compra"
  | "alquiler"
  | "producto"
  | "servicio"
  | "informacion"
  | "desconocido";

export interface LeadFrontmatter {
  id: string;
  fecha: string;
  plataforma: LeadPlatform;
  status: LeadStatus;
  rubro: string;
  interes: LeadInteres;
  nombre?: string;
  contacto?: string;
  // Inmobiliaria
  zona_preferida?: string;
  presupuesto_max?: number;
  moneda?: "ARS" | "USD";
  timing?: string;
  propiedad_id?: string;
  // CRM
  ghl_contact_id?: string;
  whatsapp_derivado?: string;
  derivado_at?: string;
}

export interface LeadBody {
  mensaje_inicial: string;
  notas_calificacion: string;
  respuestas_sugeridas: string;
}

export interface Lead extends LeadFrontmatter, LeadBody {
  filePath: string;
}
