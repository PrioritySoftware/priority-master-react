import { ButtonOpts } from "./buttonOptions.class";

export interface MessageOptions
{
    overlay?: boolean;
    title?: string;
    message?:string,
    buttons?: ButtonOpts[],
    style?:any;
}
