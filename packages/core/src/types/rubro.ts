export type RubroType =
  | "inmuebles"
  | "panaderia"
  | "camaras-seguridad"
  | "reparacion-pc"
  | "bricolage"
  | "souvenirs"
  | "tupper-cakes"
  | "gastronomia"
  | "moda"
  | "servicios-profesionales"
  | "generico";

export type OperatingMode = "simple" | "intermedio" | "avanzado";

export interface RubroConfig {
  rubro: {
    type: RubroType;
    nombre_negocio: string;
    one_liner: string;
    productos_servicios: string[];
    zona_geografica: string;
    ciudad: string;
  };
  cliente: {
    perfil: string;
    dolor: string;
    deseo: string;
    objeciones: string[];
  };
  contacto: {
    whatsapp: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    web?: string;
    email?: string;
  };
  plataformas: Array<"instagram" | "facebook" | "tiktok">;
  modo_operacion: OperatingMode;
  voice: {
    tone: string;
    pronoun: string;
    catchphrases: string[];
    banned_words: string[];
  };
  brand: {
    palette: Record<string, string>;
    typography?: { heading: string; body: string };
    story_visuals?: { background?: string; accent?: string };
  };
  calendar_defaults: {
    posts_per_day: number;
    ratio: { sale_to_value: string };
    preferred_publish_window?: string;
  };
  integraciones?: {
    ghl_api_key?: string;
    ghl_location_id?: string;
    whatsapp_business_api?: string;
  };
}
