/**
 * papex-latex contract types (subset).
 * Full contract: papex-latex/papex.schema.json (schemaVersion 1.0.0)
 */

export type SectionLevel =
  | "part"
  | "chapter"
  | "section"
  | "subsection"
  | "subsubsection";

export type RefType =
  | "article"
  | "book"
  | "inproceedings"
  | "incollection"
  | "booklet"
  | "conference"
  | "mastersthesis"
  | "phdthesis"
  | "techreport"
  | "misc"
  | "unpublished"
  | "online";

export interface PapexAuthor {
  name: string;
  orcid?: string;
  affiliation?: string;
  email?: string;
  homepage?: string;
  order?: number;
  corresponding?: boolean;
  equalContribution?: boolean;
  footnote?: string;
}

export interface PapexReference {
  key: string;
  type?: RefType;
  title?: string;
  author?: string;
  editor?: string;
  journal?: string;
  booktitle?: string;
  publisher?: string;
  institution?: string;
  school?: string;
  year?: number;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  arxivId?: string;
  note?: string;
}

export interface PapexSection {
  id?: string;
  title?: string;
  file: string;
  level?: SectionLevel;
}

export interface PapexBuildHints {
  documentclass?: string;
  fontset?: string;
  mainFont?: string;
  cjkFont?: string;
  geometry?: { paper?: string; margin?: string };
  bibStyle?: "numeric" | "authoryear";
  columns?: 1 | 2;
  hyperref?: boolean;
  passthrough?: string[];
}

export interface PapexManifest {
  schemaVersion: string;
  $schema?: string;
  paper: {
    id?: string;
    title: string;
    subtitle?: string;
    abstract: string;
    keywords?: string[];
    primaryCategoryId: string;
    secondaryCategoryIds?: string[];
    doi?: string;
    license?: string;
    version?: number;
    versionNote?: string;
    language?: "zh" | "en" | "auto";
    date?: string;
    venue?: string;
    subject?: string;
  };
  authors: PapexAuthor[];
  references?: PapexReference[];
  sections: PapexSection[];
  appendices?: PapexSection[];
  acknowledgments?: string;
  funding?: string;
  build?: PapexBuildHints;
}

export interface ArchiveFile {
  name: string;
  content: string;
}
