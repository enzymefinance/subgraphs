export function nameToSlug(name: string): string {
  let slug = "";
  for (let i = 0; i < name.length; i += 1) {
    let code = name.charCodeAt(i);

    let char = "";
    if (code >= 48 && code <= 57) {
      // numbers
      char = String.fromCharCode(code);
    } else if (code >= 97 && code <= 122) {
      // lower case characters
      char = String.fromCharCode(code);
    } else if (code >= 65 && code <= 90) {
      // convert upper case characters to lower case
      char = String.fromCharCode(code + 32);
    } else if (
      code == 32 ||
      code == 42 ||
      code == 45 ||
      code == 46 ||
      code == 60 ||
      code == 95
    ) {
      // space, period, *, underscore, dash to dash
      char = "-";
    }

    //  prevent multiple subsequent dashes
    if (i > 0 && char == "-" && slug.charAt(slug.length - 1) == "-") {
      char = "";
    }

    //prevent dash at the end
    if (i == name.length - 1 && char == "-") {
      char = "";
    }
    slug += char;
  }

  return slug;
}
