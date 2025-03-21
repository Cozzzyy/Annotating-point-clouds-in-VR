import {Annotation} from "./Annotation";

export interface LabelExport {
  attributes: {
      format_version: number | 0.1;
      annotations : Annotation[];
  }
  label_status: string | "PRELABELED",
  score: number | 0.9254,
}