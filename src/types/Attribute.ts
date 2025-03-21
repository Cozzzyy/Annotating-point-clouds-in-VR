import {Annotation} from "./Annotation";

export type Attribute = {
    format_version: number | 0.1;
    annotations : Annotation[];
}