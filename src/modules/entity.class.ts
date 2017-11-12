import { Column } from "./column.class";
export interface Entity
{
	id: number;
    type: string;
    name: string;
    title: string;
    fatname?: string;
    columns?: Column[];
    pos: number;
}