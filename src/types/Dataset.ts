import {LabelSpec} from "./LabelSpec";

export interface Dataset {
    name: string;
    url: string;
    labelSpecs?: LabelSpec[]; // Optioneel veld voor labeling specificaties
}
