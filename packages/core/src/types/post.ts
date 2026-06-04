export type PostStatus =
  | "draft"
  | "approved"
  | "needs-revision"
  | "generating-image"
  | "ready"
  | "published"
  | "failed";

export type PostPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "multi";

export type PostFormat =
  | "post"
  | "carrusel"
  | "historia"
  | "reel"
  | "video";

export type FunnelStage =
  | "awareness"
  | "trust"
  | "objection"
  | "consultation"
  | "closing";

export type PostFunction =
  | "gancho"
  | "empatia"
  | "insight"
  | "prueba"
  | "cta"
  | "objecion"
  | "urgencia"
  | "presentacion"
  | "testimonio"
  | "educativo";

export interface PostFrontmatter {
  id: string;
  date: string;
  slot: number;
  status: PostStatus;
  platform: PostPlatform;
  format: PostFormat;
  funnel_stage: FunnelStage;
  function: PostFunction;
  sale: boolean;
  rubro: string;
  image_model: string;
  image_url: string;
  container_id: string;
  published_at: string;
  change_request?: string;
  image_error?: string;
  // Para inmobiliaria: referencia a propiedad asociada
  propiedad_id?: string;
}

export interface PostBody {
  text: string;
  subtext: string;
  cta: string;
  dm_response: string;
  whatsapp_cta: string;
  imagePrompt: string;
  notes: string;
}

export interface Post extends PostFrontmatter, PostBody {
  filePath: string;
}

export interface PlatformGroup {
  platform: PostPlatform;
  count: number;
  byStatus: Record<PostStatus, number>;
}

export interface CalendarSummary {
  date: string;
  count: number;
  byStatus: Record<PostStatus, number>;
  byPlatform: PlatformGroup[];
}
