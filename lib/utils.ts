export function generateOrderNumber(lastNumber: string | null): string {
  if (!lastNumber) return "00001";

  let prefix = lastNumber.replace(/[0-9]/g, ""); 
  let numPart = parseInt(lastNumber.replace(/[^0-9]/g, "")); 

  if (numPart < 99999) {
    return prefix + (numPart + 1).toString().padStart(prefix ? 4 : 5, "0");
  } else {
    let nextPrefix = prefix === "" ? "A" : String.fromCharCode(prefix.charCodeAt(0) + 1);
    return nextPrefix + "0001";
  }
}