export interface Column
{
    /** @type {number} [description] */
    attachment: number;
    /** @type {number} Decimal percition. Used for decimal fields. */
    decimal: number;
    /** @type {string} [description] */
    format: string;
    /** @type {number} Is the field is mandatory. 0 or 1 */
    mandatory: number;
    /** @type {number} Fields max length. Used for text and number fields. */
    maxLength: number;
    /** @type {number} Is the field is a read-only field.  0 or 1 */
    readonly: number;
    /** @type {string} Fields text for display. */
    title: string;
    /** @type {string} Fileds type, one of: [number,date etc.] */
    type: string
    /** @type {string} Fields zoom type. Used for indicating if and what type of "zoom" can be made into the filed. */
    zoom: string;
     /** @type {string} Fields name. */
    key:string;

    /** Fields name in the form. */
    name:string;
    /** Is the field defined as a search field. Used for filtering  'getRows' results. 0 or 1 */
    searchfield:number;
    /** Is the field is a key field.  0 or 1 */
    iskey:number;
    /** Should the field be displayed in a list page. 0 or 1 */
    tabview:number;
    /** Should the field be displayed in a ditails page.  0 or 1 */
    lineview:number;
    /** The fields position for sort */
    pos:number;
    /** Is field a special type 'B' for barcode 'P' for phone */
    special: string;
    /** Backward compatibility for barcode instead of special  */
    barcode: number;}