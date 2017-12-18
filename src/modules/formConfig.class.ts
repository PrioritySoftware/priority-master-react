import { ColumnsOptions } from "./columnOptions.class";
import { DirectActivation } from "./directActivation.class";

export declare class FormConfig
{
	name: string;
	title:string;
	subforms: Array<{ name: string, title: string }>
	parentForm: string;
	searchColumns: Array<string>;
	detailsColumnsOptions: ColumnsOptions;
	listColumnsOptions: ColumnsOptions;
	pos: number;
	activations: { [key: string]: DirectActivation };
}