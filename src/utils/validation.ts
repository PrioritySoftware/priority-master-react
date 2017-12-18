export function number(value : string, maxLength : number, decimal: number, code: string) {
    
    const valueStr = value.replace(/,/g,'');
    if(code === 'Real' && decimal === 0)
    {
        return valueStr.length <= maxLength;
    }
    const decimalAndPoint = decimal ? decimal + 1 : 0;
    const parts = valueStr.split('.');
    
    if(parts[1] && decimal === 0)
        return false;

    const befforeDecimalLength = parts[0].length;
    const afterDecimalLength = parts[1] ? parts[1].length : 0;
    
    return befforeDecimalLength + decimalAndPoint <= maxLength && afterDecimalLength <= decimal;
}
