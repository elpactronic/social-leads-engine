export type {
  Post,
  PostBody,
  PostFrontmatter,
  PostStatus,
  PostPlatform,
  PostFormat,
  PostFunction,
  FunnelStage,
  CalendarSummary,
} from "./types/post";

export type {
  Propiedad,
  PropiedadFrontmatter,
  PropiedadSummary,
  TipoOperacion,
  TipoInmueble,
  EstadoPropiedad,
} from "./types/propiedad";

export type {
  Lead,
  LeadFrontmatter,
  LeadStatus,
  LeadPlatform,
  LeadInteres,
} from "./types/lead";

export type { RubroConfig, RubroType, OperatingMode } from "./types/rubro";

export {
  loadRubro,
  isRubroConfigured,
  buildImagePrompt,
  buildWhatsAppLink,
  RubroNotConfiguredError,
} from "./lib/rubro";

export {
  listCalendars,
  listPosts,
  findPostById,
  updatePost,
  deletePost,
  archivePublishedPost,
} from "./lib/content";

export {
  listPropiedades,
  findPropiedadById,
  savePropiedad,
  updatePropiedad,
} from "./lib/propiedad";

export {
  listLeads,
  findLeadById,
  saveLead,
  updateLead,
} from "./lib/lead";

export { createTask, getTaskInfo, pollUntilDone } from "./lib/kie";
export type {
  KieAspectRatio,
  KieModelId,
  KieCreateTaskInput,
  KieTaskCreated,
  KieTaskStatus,
  KieTaskInfo,
} from "./lib/kie";

export {
  createStoryContainer,
  publishContainer,
  publishStory,
  getPublishingLimit,
} from "./lib/instagram";
export type { PublishStoryInput, PublishStoryResult } from "./lib/instagram";

export { renderMarkdown } from "./lib/markdown";

export { buildZip } from "./lib/zip";
export type { ZipEntry } from "./lib/zip";

export { getProjectRoot } from "./lib/paths";
