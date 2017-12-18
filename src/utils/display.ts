import * as moment from 'moment';
import { DOMParser } from 'xmldom';
// import 'number-to-locale-string';

export function concat(field1, field2)
{
    if (field1 && field2)
    {
        return field1 + field2;
    }
    return '';
}

export function date(dateVal, format)
{
    if (date && format)
        return moment(dateVal).format(format);
}

export function number(numberVal, precision)
{

    return numberVal.toLocaleString('en', { minimumFractionDigits: precision });

}

export function htmlToText(htmlArray)
{
    let html = '';
    for (let idx in htmlArray) 
    {
        if (htmlArray.hasOwnProperty(idx))
        {
            html += htmlArray[idx].TEXT + ' ';
        }

    }
    html = html.replace(/<br \/>/g, '\n');
    if (html === '')
    {
        return '';
    }
    try
    {
        const stringVal = (new DOMParser).parseFromString(html.replace(/<style>.+<\/style>/g, ''), "text/html");
        return stringVal.documentElement.textContent;
        // return text;
    }
    catch (err)
    {
        return '';
    }
}

export function htmlToJS(xml, tag)
{
    try
    {
        if (xml === null || xml === "")
            return "";
        let parser = new DOMParser();
        let doc = parser.parseFromString(xml, "text/html");
        if (doc == null)
            return "";
        let errorDesc = doc.getElementsByTagName(tag);
        if (errorDesc == null || errorDesc[0] == null)
            return "";
        return errorDesc[0].childNodes[0].nodeValue;
    } catch (err)
    {
        console.log("caught error " + err + " parsing text " + xml);
        return "";
    }
}

export function textToHtml(text)
{
    return text ? text.replace(/\n\r?/g, '<br />') : null;
}

export function capitalize(stringVal)
{
    return stringVal.charAt(0).toUpperCase() + stringVal.slice(1);
}

export function capitalizeAll(stringVal)
{
    return stringVal.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export function strToFloat(val)
{
    if (typeof val === 'string')
    {
        if (val.length > 0)
            return parseFloat(val.replace(/,/g, ''));
        else
            return 0;
    }
    else
        return val;
}
