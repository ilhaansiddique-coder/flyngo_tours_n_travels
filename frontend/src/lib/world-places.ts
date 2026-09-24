export interface WorldPlace {
  id?: string;
  name: string;        // Display name: e.g. "London, United Kingdom" or "United Kingdom"
  cityName?: string;   // City name if this is a city
  country: string;     // Country name
  continent: string;   // Continent
  iso2: string;        // 2-letter ISO country code
  flagUrl: string;     // SVG flag URL
  isCity: boolean;     // true if city, false if country
  slug: string;        // unique URL slug
}

export function getFlagUrl(iso2: string): string {
  return `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${iso2.toLowerCase()}.svg`;
}

// ---------------------------------------------------------------------------
// 1. All World Countries & Territories (249)
// ---------------------------------------------------------------------------
export const WORLD_COUNTRIES: Array<{ name: string; officialName?: string; iso2: string; continent: string }> = [
  {
    "name": "Afghanistan",
    "officialName": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "name": "Åland Islands",
    "officialName": "Åland Islands",
    "iso2": "ax",
    "continent": "Europe"
  },
  {
    "name": "Albania",
    "officialName": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "name": "Algeria",
    "officialName": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "name": "American Samoa",
    "officialName": "American Samoa",
    "iso2": "as",
    "continent": "Oceania"
  },
  {
    "name": "Andorra",
    "officialName": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "name": "Angola",
    "officialName": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "name": "Anguilla",
    "officialName": "Anguilla",
    "iso2": "ai",
    "continent": "Americas"
  },
  {
    "name": "Antarctica",
    "officialName": "Antarctica",
    "iso2": "aq",
    "continent": "World"
  },
  {
    "name": "Antigua and Barbuda",
    "officialName": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "name": "Argentina",
    "officialName": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "name": "Armenia",
    "officialName": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "name": "Aruba",
    "officialName": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "name": "Australia",
    "officialName": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "name": "Austria",
    "officialName": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "name": "Azerbaijan",
    "officialName": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "name": "Bahamas",
    "officialName": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "name": "Bahrain",
    "officialName": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "name": "Bangladesh",
    "officialName": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "name": "Barbados",
    "officialName": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "name": "Belarus",
    "officialName": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "name": "Belgium",
    "officialName": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "name": "Belize",
    "officialName": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "name": "Benin",
    "officialName": "Benin",
    "iso2": "bj",
    "continent": "Africa"
  },
  {
    "name": "Bermuda",
    "officialName": "Bermuda",
    "iso2": "bm",
    "continent": "Americas"
  },
  {
    "name": "Bhutan",
    "officialName": "Bhutan",
    "iso2": "bt",
    "continent": "Asia"
  },
  {
    "name": "Bolivia",
    "officialName": "Bolivia, Plurinational State of",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "name": "Bonaire, Sint Eustatius and Saba",
    "officialName": "Bonaire, Sint Eustatius and Saba",
    "iso2": "bq",
    "continent": "Americas"
  },
  {
    "name": "Bosnia and Herzegovina",
    "officialName": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "name": "Botswana",
    "officialName": "Botswana",
    "iso2": "bw",
    "continent": "Africa"
  },
  {
    "name": "Bouvet Island",
    "officialName": "Bouvet Island",
    "iso2": "bv",
    "continent": "Americas"
  },
  {
    "name": "Brazil",
    "officialName": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "name": "British Indian Ocean Territory",
    "officialName": "British Indian Ocean Territory",
    "iso2": "io",
    "continent": "Africa"
  },
  {
    "name": "Brunei Darussalam",
    "officialName": "Brunei Darussalam",
    "iso2": "bn",
    "continent": "Asia"
  },
  {
    "name": "Bulgaria",
    "officialName": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "name": "Burkina Faso",
    "officialName": "Burkina Faso",
    "iso2": "bf",
    "continent": "Africa"
  },
  {
    "name": "Burundi",
    "officialName": "Burundi",
    "iso2": "bi",
    "continent": "Africa"
  },
  {
    "name": "Cabo Verde",
    "officialName": "Cabo Verde",
    "iso2": "cv",
    "continent": "Africa"
  },
  {
    "name": "Cambodia",
    "officialName": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "name": "Cameroon",
    "officialName": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "name": "Canada",
    "officialName": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "name": "Cayman Islands",
    "officialName": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "name": "Central African Republic",
    "officialName": "Central African Republic",
    "iso2": "cf",
    "continent": "Africa"
  },
  {
    "name": "Chad",
    "officialName": "Chad",
    "iso2": "td",
    "continent": "Africa"
  },
  {
    "name": "Chile",
    "officialName": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "name": "China",
    "officialName": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "name": "Christmas Island",
    "officialName": "Christmas Island",
    "iso2": "cx",
    "continent": "Oceania"
  },
  {
    "name": "Cocos (Keeling) Islands",
    "officialName": "Cocos (Keeling) Islands",
    "iso2": "cc",
    "continent": "Oceania"
  },
  {
    "name": "Colombia",
    "officialName": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "name": "Comoros",
    "officialName": "Comoros",
    "iso2": "km",
    "continent": "Africa"
  },
  {
    "name": "Congo",
    "officialName": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "name": "DR Congo",
    "officialName": "Congo, Democratic Republic of the",
    "iso2": "cd",
    "continent": "Africa"
  },
  {
    "name": "Cook Islands",
    "officialName": "Cook Islands",
    "iso2": "ck",
    "continent": "Oceania"
  },
  {
    "name": "Costa Rica",
    "officialName": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "name": "Côte d'Ivoire",
    "officialName": "Côte d'Ivoire",
    "iso2": "ci",
    "continent": "Africa"
  },
  {
    "name": "Croatia",
    "officialName": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "name": "Cuba",
    "officialName": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "name": "Curaçao",
    "officialName": "Curaçao",
    "iso2": "cw",
    "continent": "Americas"
  },
  {
    "name": "Cyprus",
    "officialName": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "name": "Czechia",
    "officialName": "Czechia",
    "iso2": "cz",
    "continent": "Europe"
  },
  {
    "name": "Denmark",
    "officialName": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "name": "Djibouti",
    "officialName": "Djibouti",
    "iso2": "dj",
    "continent": "Africa"
  },
  {
    "name": "Dominica",
    "officialName": "Dominica",
    "iso2": "dm",
    "continent": "Americas"
  },
  {
    "name": "Dominican Republic",
    "officialName": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "name": "Ecuador",
    "officialName": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "name": "Egypt",
    "officialName": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "name": "El Salvador",
    "officialName": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "name": "Equatorial Guinea",
    "officialName": "Equatorial Guinea",
    "iso2": "gq",
    "continent": "Africa"
  },
  {
    "name": "Eritrea",
    "officialName": "Eritrea",
    "iso2": "er",
    "continent": "Africa"
  },
  {
    "name": "Estonia",
    "officialName": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "name": "Eswatini",
    "officialName": "Eswatini",
    "iso2": "sz",
    "continent": "Africa"
  },
  {
    "name": "Ethiopia",
    "officialName": "Ethiopia",
    "iso2": "et",
    "continent": "Africa"
  },
  {
    "name": "Falkland Islands (Malvinas)",
    "officialName": "Falkland Islands (Malvinas)",
    "iso2": "fk",
    "continent": "Americas"
  },
  {
    "name": "Faroe Islands",
    "officialName": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "name": "Fiji",
    "officialName": "Fiji",
    "iso2": "fj",
    "continent": "Oceania"
  },
  {
    "name": "Finland",
    "officialName": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "name": "France",
    "officialName": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "name": "French Guiana",
    "officialName": "French Guiana",
    "iso2": "gf",
    "continent": "Americas"
  },
  {
    "name": "French Polynesia",
    "officialName": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "name": "French Southern Territories",
    "officialName": "French Southern Territories",
    "iso2": "tf",
    "continent": "Africa"
  },
  {
    "name": "Gabon",
    "officialName": "Gabon",
    "iso2": "ga",
    "continent": "Africa"
  },
  {
    "name": "Gambia",
    "officialName": "Gambia",
    "iso2": "gm",
    "continent": "Africa"
  },
  {
    "name": "Georgia",
    "officialName": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "name": "Germany",
    "officialName": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "name": "Ghana",
    "officialName": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "name": "Gibraltar",
    "officialName": "Gibraltar",
    "iso2": "gi",
    "continent": "Europe"
  },
  {
    "name": "Greece",
    "officialName": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "name": "Greenland",
    "officialName": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "name": "Grenada",
    "officialName": "Grenada",
    "iso2": "gd",
    "continent": "Americas"
  },
  {
    "name": "Guadeloupe",
    "officialName": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "name": "Guam",
    "officialName": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "name": "Guatemala",
    "officialName": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "name": "Guernsey",
    "officialName": "Guernsey",
    "iso2": "gg",
    "continent": "Europe"
  },
  {
    "name": "Guinea",
    "officialName": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "name": "Guinea-Bissau",
    "officialName": "Guinea-Bissau",
    "iso2": "gw",
    "continent": "Africa"
  },
  {
    "name": "Guyana",
    "officialName": "Guyana",
    "iso2": "gy",
    "continent": "Americas"
  },
  {
    "name": "Haiti",
    "officialName": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "name": "Heard Island and McDonald Islands",
    "officialName": "Heard Island and McDonald Islands",
    "iso2": "hm",
    "continent": "Oceania"
  },
  {
    "name": "Holy See",
    "officialName": "Holy See",
    "iso2": "va",
    "continent": "Europe"
  },
  {
    "name": "Honduras",
    "officialName": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "name": "Hong Kong",
    "officialName": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "name": "Hungary",
    "officialName": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "name": "Iceland",
    "officialName": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "name": "India",
    "officialName": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "name": "Indonesia",
    "officialName": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "name": "Iran",
    "officialName": "Iran, Islamic Republic of",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "name": "Iraq",
    "officialName": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "name": "Ireland",
    "officialName": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "name": "Isle of Man",
    "officialName": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "name": "Israel",
    "officialName": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "name": "Italy",
    "officialName": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "name": "Jamaica",
    "officialName": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "name": "Japan",
    "officialName": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "name": "Jersey",
    "officialName": "Jersey",
    "iso2": "je",
    "continent": "Europe"
  },
  {
    "name": "Jordan",
    "officialName": "Jordan",
    "iso2": "jo",
    "continent": "Asia"
  },
  {
    "name": "Kazakhstan",
    "officialName": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "name": "Kenya",
    "officialName": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "name": "Kiribati",
    "officialName": "Kiribati",
    "iso2": "ki",
    "continent": "Oceania"
  },
  {
    "name": "North Korea",
    "officialName": "Korea, Democratic People's Republic of",
    "iso2": "kp",
    "continent": "Asia"
  },
  {
    "name": "South Korea",
    "officialName": "Korea, Republic of",
    "iso2": "kr",
    "continent": "Asia"
  },
  {
    "name": "Kuwait",
    "officialName": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "name": "Kyrgyzstan",
    "officialName": "Kyrgyzstan",
    "iso2": "kg",
    "continent": "Asia"
  },
  {
    "name": "Laos",
    "officialName": "Lao People's Democratic Republic",
    "iso2": "la",
    "continent": "Asia"
  },
  {
    "name": "Latvia",
    "officialName": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "name": "Lebanon",
    "officialName": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "name": "Lesotho",
    "officialName": "Lesotho",
    "iso2": "ls",
    "continent": "Africa"
  },
  {
    "name": "Liberia",
    "officialName": "Liberia",
    "iso2": "lr",
    "continent": "Africa"
  },
  {
    "name": "Libya",
    "officialName": "Libya",
    "iso2": "ly",
    "continent": "Africa"
  },
  {
    "name": "Liechtenstein",
    "officialName": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "name": "Lithuania",
    "officialName": "Lithuania",
    "iso2": "lt",
    "continent": "Europe"
  },
  {
    "name": "Luxembourg",
    "officialName": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "name": "Macao",
    "officialName": "Macao",
    "iso2": "mo",
    "continent": "Asia"
  },
  {
    "name": "Madagascar",
    "officialName": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "name": "Malawi",
    "officialName": "Malawi",
    "iso2": "mw",
    "continent": "Africa"
  },
  {
    "name": "Malaysia",
    "officialName": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "name": "Maldives",
    "officialName": "Maldives",
    "iso2": "mv",
    "continent": "Asia"
  },
  {
    "name": "Mali",
    "officialName": "Mali",
    "iso2": "ml",
    "continent": "Africa"
  },
  {
    "name": "Malta",
    "officialName": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "name": "Marshall Islands",
    "officialName": "Marshall Islands",
    "iso2": "mh",
    "continent": "Oceania"
  },
  {
    "name": "Martinique",
    "officialName": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "name": "Mauritania",
    "officialName": "Mauritania",
    "iso2": "mr",
    "continent": "Africa"
  },
  {
    "name": "Mauritius",
    "officialName": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "name": "Mayotte",
    "officialName": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "name": "Mexico",
    "officialName": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "name": "Micronesia, Federated States of",
    "officialName": "Micronesia, Federated States of",
    "iso2": "fm",
    "continent": "Oceania"
  },
  {
    "name": "Moldova",
    "officialName": "Moldova, Republic of",
    "iso2": "md",
    "continent": "Europe"
  },
  {
    "name": "Monaco",
    "officialName": "Monaco",
    "iso2": "mc",
    "continent": "Europe"
  },
  {
    "name": "Mongolia",
    "officialName": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "name": "Montenegro",
    "officialName": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "name": "Montserrat",
    "officialName": "Montserrat",
    "iso2": "ms",
    "continent": "Americas"
  },
  {
    "name": "Morocco",
    "officialName": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "name": "Mozambique",
    "officialName": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "name": "Myanmar",
    "officialName": "Myanmar",
    "iso2": "mm",
    "continent": "Asia"
  },
  {
    "name": "Namibia",
    "officialName": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "name": "Nauru",
    "officialName": "Nauru",
    "iso2": "nr",
    "continent": "Oceania"
  },
  {
    "name": "Nepal",
    "officialName": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "name": "Netherlands, Kingdom of the",
    "officialName": "Netherlands, Kingdom of the",
    "iso2": "nl",
    "continent": "Europe"
  },
  {
    "name": "New Caledonia",
    "officialName": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "name": "New Zealand",
    "officialName": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "name": "Nicaragua",
    "officialName": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "name": "Niger",
    "officialName": "Niger",
    "iso2": "ne",
    "continent": "Africa"
  },
  {
    "name": "Nigeria",
    "officialName": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "name": "Niue",
    "officialName": "Niue",
    "iso2": "nu",
    "continent": "Oceania"
  },
  {
    "name": "Norfolk Island",
    "officialName": "Norfolk Island",
    "iso2": "nf",
    "continent": "Oceania"
  },
  {
    "name": "North Macedonia",
    "officialName": "North Macedonia",
    "iso2": "mk",
    "continent": "Europe"
  },
  {
    "name": "Northern Mariana Islands",
    "officialName": "Northern Mariana Islands",
    "iso2": "mp",
    "continent": "Oceania"
  },
  {
    "name": "Norway",
    "officialName": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "name": "Oman",
    "officialName": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "name": "Pakistan",
    "officialName": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "name": "Palau",
    "officialName": "Palau",
    "iso2": "pw",
    "continent": "Oceania"
  },
  {
    "name": "Palestine, State of",
    "officialName": "Palestine, State of",
    "iso2": "ps",
    "continent": "Asia"
  },
  {
    "name": "Panama",
    "officialName": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "name": "Papua New Guinea",
    "officialName": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "name": "Paraguay",
    "officialName": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "name": "Peru",
    "officialName": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "name": "Philippines",
    "officialName": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "name": "Pitcairn",
    "officialName": "Pitcairn",
    "iso2": "pn",
    "continent": "Oceania"
  },
  {
    "name": "Poland",
    "officialName": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "name": "Portugal",
    "officialName": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "name": "Puerto Rico",
    "officialName": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "name": "Qatar",
    "officialName": "Qatar",
    "iso2": "qa",
    "continent": "Asia"
  },
  {
    "name": "Réunion",
    "officialName": "Réunion",
    "iso2": "re",
    "continent": "Africa"
  },
  {
    "name": "Romania",
    "officialName": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "name": "Russia",
    "officialName": "Russian Federation",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "name": "Rwanda",
    "officialName": "Rwanda",
    "iso2": "rw",
    "continent": "Africa"
  },
  {
    "name": "Saint Barthélemy",
    "officialName": "Saint Barthélemy",
    "iso2": "bl",
    "continent": "Americas"
  },
  {
    "name": "Saint Helena, Ascension and Tristan da Cunha",
    "officialName": "Saint Helena, Ascension and Tristan da Cunha",
    "iso2": "sh",
    "continent": "Africa"
  },
  {
    "name": "Saint Kitts and Nevis",
    "officialName": "Saint Kitts and Nevis",
    "iso2": "kn",
    "continent": "Americas"
  },
  {
    "name": "Saint Lucia",
    "officialName": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "name": "Saint Martin (French part)",
    "officialName": "Saint Martin (French part)",
    "iso2": "mf",
    "continent": "Americas"
  },
  {
    "name": "Saint Pierre and Miquelon",
    "officialName": "Saint Pierre and Miquelon",
    "iso2": "pm",
    "continent": "Americas"
  },
  {
    "name": "Saint Vincent and the Grenadines",
    "officialName": "Saint Vincent and the Grenadines",
    "iso2": "vc",
    "continent": "Americas"
  },
  {
    "name": "Samoa",
    "officialName": "Samoa",
    "iso2": "ws",
    "continent": "Oceania"
  },
  {
    "name": "San Marino",
    "officialName": "San Marino",
    "iso2": "sm",
    "continent": "Europe"
  },
  {
    "name": "Sao Tome and Principe",
    "officialName": "Sao Tome and Principe",
    "iso2": "st",
    "continent": "Africa"
  },
  {
    "name": "Saudi Arabia",
    "officialName": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "name": "Senegal",
    "officialName": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "name": "Serbia",
    "officialName": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "name": "Seychelles",
    "officialName": "Seychelles",
    "iso2": "sc",
    "continent": "Africa"
  },
  {
    "name": "Sierra Leone",
    "officialName": "Sierra Leone",
    "iso2": "sl",
    "continent": "Africa"
  },
  {
    "name": "Singapore",
    "officialName": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "name": "Sint Maarten (Dutch part)",
    "officialName": "Sint Maarten (Dutch part)",
    "iso2": "sx",
    "continent": "Americas"
  },
  {
    "name": "Slovakia",
    "officialName": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "name": "Slovenia",
    "officialName": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "name": "Solomon Islands",
    "officialName": "Solomon Islands",
    "iso2": "sb",
    "continent": "Oceania"
  },
  {
    "name": "Somalia",
    "officialName": "Somalia",
    "iso2": "so",
    "continent": "Africa"
  },
  {
    "name": "South Africa",
    "officialName": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "name": "South Georgia and the South Sandwich Islands",
    "officialName": "South Georgia and the South Sandwich Islands",
    "iso2": "gs",
    "continent": "Americas"
  },
  {
    "name": "South Sudan",
    "officialName": "South Sudan",
    "iso2": "ss",
    "continent": "Africa"
  },
  {
    "name": "Spain",
    "officialName": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "name": "Sri Lanka",
    "officialName": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "name": "Sudan",
    "officialName": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "name": "Suriname",
    "officialName": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "name": "Svalbard and Jan Mayen",
    "officialName": "Svalbard and Jan Mayen",
    "iso2": "sj",
    "continent": "Europe"
  },
  {
    "name": "Sweden",
    "officialName": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "name": "Switzerland",
    "officialName": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "name": "Syria",
    "officialName": "Syrian Arab Republic",
    "iso2": "sy",
    "continent": "Asia"
  },
  {
    "name": "Taiwan",
    "officialName": "Taiwan, Province of China",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "name": "Tajikistan",
    "officialName": "Tajikistan",
    "iso2": "tj",
    "continent": "Asia"
  },
  {
    "name": "Tanzania",
    "officialName": "Tanzania, United Republic of",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "name": "Thailand",
    "officialName": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "name": "Timor-Leste",
    "officialName": "Timor-Leste",
    "iso2": "tl",
    "continent": "Asia"
  },
  {
    "name": "Togo",
    "officialName": "Togo",
    "iso2": "tg",
    "continent": "Africa"
  },
  {
    "name": "Tokelau",
    "officialName": "Tokelau",
    "iso2": "tk",
    "continent": "Oceania"
  },
  {
    "name": "Tonga",
    "officialName": "Tonga",
    "iso2": "to",
    "continent": "Oceania"
  },
  {
    "name": "Trinidad and Tobago",
    "officialName": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "name": "Tunisia",
    "officialName": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "name": "Turkey",
    "officialName": "Türkiye",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "name": "Turkmenistan",
    "officialName": "Turkmenistan",
    "iso2": "tm",
    "continent": "Asia"
  },
  {
    "name": "Turks and Caicos Islands",
    "officialName": "Turks and Caicos Islands",
    "iso2": "tc",
    "continent": "Americas"
  },
  {
    "name": "Tuvalu",
    "officialName": "Tuvalu",
    "iso2": "tv",
    "continent": "Oceania"
  },
  {
    "name": "Uganda",
    "officialName": "Uganda",
    "iso2": "ug",
    "continent": "Africa"
  },
  {
    "name": "Ukraine",
    "officialName": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "name": "United Arab Emirates",
    "officialName": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "name": "United Kingdom",
    "officialName": "United Kingdom of Great Britain and Northern Ireland",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "name": "United States",
    "officialName": "United States of America",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "name": "United States Minor Outlying Islands",
    "officialName": "United States Minor Outlying Islands",
    "iso2": "um",
    "continent": "Oceania"
  },
  {
    "name": "Uruguay",
    "officialName": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "name": "Uzbekistan",
    "officialName": "Uzbekistan",
    "iso2": "uz",
    "continent": "Asia"
  },
  {
    "name": "Vanuatu",
    "officialName": "Vanuatu",
    "iso2": "vu",
    "continent": "Oceania"
  },
  {
    "name": "Venezuela",
    "officialName": "Venezuela, Bolivarian Republic of",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "name": "Vietnam",
    "officialName": "Viet Nam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "name": "Virgin Islands (British)",
    "officialName": "Virgin Islands (British)",
    "iso2": "vg",
    "continent": "Americas"
  },
  {
    "name": "Virgin Islands (U.S.)",
    "officialName": "Virgin Islands (U.S.)",
    "iso2": "vi",
    "continent": "Americas"
  },
  {
    "name": "Wallis and Futuna",
    "officialName": "Wallis and Futuna",
    "iso2": "wf",
    "continent": "Oceania"
  },
  {
    "name": "Western Sahara",
    "officialName": "Western Sahara",
    "iso2": "eh",
    "continent": "Africa"
  },
  {
    "name": "Yemen",
    "officialName": "Yemen",
    "iso2": "ye",
    "continent": "Asia"
  },
  {
    "name": "Zambia",
    "officialName": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "name": "Zimbabwe",
    "officialName": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  }
];

// ---------------------------------------------------------------------------
// 2. All World Cities across all Countries (1946)
// ---------------------------------------------------------------------------
export const WORLD_CITIES: Array<{ city: string; country: string; iso2: string; continent: string }> = [
  {
    "city": "Kabul",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Herat",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Kandahar",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Molah",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Rana",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Shar",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Sharif",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Wazir Akbar Khan",
    "country": "Afghanistan",
    "iso2": "af",
    "continent": "Asia"
  },
  {
    "city": "Åland Islands",
    "country": "Åland Islands",
    "iso2": "ax",
    "continent": "Europe"
  },
  {
    "city": "Tirana",
    "country": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "city": "Elbasan",
    "country": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "city": "Petran",
    "country": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "city": "Pogradec",
    "country": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "city": "Shkoder",
    "country": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "city": "Ura Vajgurore",
    "country": "Albania",
    "iso2": "al",
    "continent": "Europe"
  },
  {
    "city": "Alger",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Algiers",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Annaba",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Azazga",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Batna City",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Blida",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Bordj",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Bordj Bou Arreridj",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Bougara",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Cheraga",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Chlef",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Constantine",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Djelfa",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Draria",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "El Tarf",
    "country": "Algeria",
    "iso2": "dz",
    "continent": "Africa"
  },
  {
    "city": "Fagatogo",
    "country": "American Samoa",
    "iso2": "as",
    "continent": "Oceania"
  },
  {
    "city": "Andorra la Vella",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Canillo",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Encamp",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Engordany",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Escaldes-Engordany",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "La Massana",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Llorts",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Ordino",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Santa Coloma",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Sispony",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Soldeu",
    "country": "Andorra",
    "iso2": "ad",
    "continent": "Europe"
  },
  {
    "city": "Luanda",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Ambriz",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Benguela",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Cabinda",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Cacole",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Camabatela",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Cazeta",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Huambo",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Kuito",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Lobito",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Lubango",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Lucapa",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Lumeje",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Malanje",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "Menongue",
    "country": "Angola",
    "iso2": "ao",
    "continent": "Africa"
  },
  {
    "city": "The Valley",
    "country": "Anguilla",
    "iso2": "ai",
    "continent": "Americas"
  },
  {
    "city": "Antarctica",
    "country": "Antarctica",
    "iso2": "aq",
    "continent": "World"
  },
  {
    "city": "Saint John's",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "All Saints",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "Cassada Gardens",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "Codrington",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "Old Road",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "Parham",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "Woods",
    "country": "Antigua and Barbuda",
    "iso2": "ag",
    "continent": "Americas"
  },
  {
    "city": "Buenos Aires",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "28 de Noviembre",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Abasto",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Acassuso",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Acebal",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Acevedo",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Adelia Maria",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Agua de Oro",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Albardon",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Albarellos",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Alberdi",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Alberti",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Aldo Bonzi",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Alejandro Korn",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Alicia",
    "country": "Argentina",
    "iso2": "ar",
    "continent": "Americas"
  },
  {
    "city": "Yerevan",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Abovyan",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Agarak",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Apaga",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Aparan",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Arabkir",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Ashtarak",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Erebuni Fortress",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Hrazdan",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Ijevan",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Jermuk",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Kapan",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Tsaghkadzor",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Vanadzor",
    "country": "Armenia",
    "iso2": "am",
    "continent": "Asia"
  },
  {
    "city": "Oranjestad",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Noord",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Palm Beach",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Paradera",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Ponton",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Sabaneta",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "San Barbola",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Santa Cruz",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Sero Blanco",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Sint Nicolaas",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Tanki Lender",
    "country": "Aruba",
    "iso2": "aw",
    "continent": "Americas"
  },
  {
    "city": "Sydney",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Melbourne",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Brisbane",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Perth",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Adelaide",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Gold Coast",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Cairns",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Canberra",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Hobart",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Abbotsford",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Abbotsham",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Aberdeen",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Aberfoyle",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Aberglasslyn",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Abermain",
    "country": "Australia",
    "iso2": "au",
    "continent": "Oceania"
  },
  {
    "city": "Wien",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Vienna",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Salzburg",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Absam",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Absdorf",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Abtenau",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Abtsdorf",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Ach",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Achenkirch",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Achensee",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Admont",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Adnet",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Afritz",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Aggsbach",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Aichbach",
    "country": "Austria",
    "iso2": "at",
    "continent": "Europe"
  },
  {
    "city": "Baku",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Nakhchivan",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Quba",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Qusar",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Sulutapa",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Sumqayit",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Xirdalan",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Zurges",
    "country": "Azerbaijan",
    "iso2": "az",
    "continent": "Asia"
  },
  {
    "city": "Nassau",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "Andros Town",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "Dunmore Town",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "Freeport",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "Marsh Harbour",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "Palmetto Point",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "Spanish Wells",
    "country": "Bahamas",
    "iso2": "bs",
    "continent": "Americas"
  },
  {
    "city": "al-Manama",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Manama",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Al Budayyi`",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Al Hadd",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Al Hamalah",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Al Janabiyah",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Al Markh",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Al Muharraq",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Bani Jamrah",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Barbar",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Jurdab",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Madinat `Isa",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Madinat Hamad",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Oil City",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Sanabis",
    "country": "Bahrain",
    "iso2": "bh",
    "continent": "Asia"
  },
  {
    "city": "Dhaka",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Chittagong",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Sylhet",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Cox's Bazar",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Rajshahi",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Khulna",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Barisal",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Rangpur",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Mymensingh",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Comilla",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Sreemangal",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Kuakata",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Saint Martin Island",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Agrabad",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Bangla",
    "country": "Bangladesh",
    "iso2": "bd",
    "continent": "Asia"
  },
  {
    "city": "Bridgetown",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Atlantic Shores",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Bagatelle",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Bloomsbury",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Bruce Vale",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Cave Hill",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Clapham",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Hastings",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Holetown",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Husbands",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Jackmans",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Oistins",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Pine Housing Estate",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Porters",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Rendezvous",
    "country": "Barbados",
    "iso2": "bb",
    "continent": "Americas"
  },
  {
    "city": "Minsk",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Baranovichi",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Borisov",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Brest",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Dzyarzhynsk",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Horki",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Hrodna",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Lahoysk",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Lida",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Lyakhovichi",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Lyaskavichy",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Mazyr",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Mogilev",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Navapolatsk",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Orsha",
    "country": "Belarus",
    "iso2": "by",
    "continent": "Europe"
  },
  {
    "city": "Bruxelles [Brussel]",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aalbeke",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aalst",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aalter",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aarschot",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aarsele",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aartrijke",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Aartselaar",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Achel",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Adegem",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Adinkerke",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Afsnee",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Agimont",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Alken",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Alleur",
    "country": "Belgium",
    "iso2": "be",
    "continent": "Europe"
  },
  {
    "city": "Belmopan",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "Belize City",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "Benque Viejo del Carmen",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "Freetown Sibun",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "Ladyville",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "San Ignacio",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "San Pedro Town",
    "country": "Belize",
    "iso2": "bz",
    "continent": "Americas"
  },
  {
    "city": "Porto-Novo",
    "country": "Benin",
    "iso2": "bj",
    "continent": "Africa"
  },
  {
    "city": "Hamilton",
    "country": "Bermuda",
    "iso2": "bm",
    "continent": "Americas"
  },
  {
    "city": "Thimphu",
    "country": "Bhutan",
    "iso2": "bt",
    "continent": "Asia"
  },
  {
    "city": "Paro",
    "country": "Bhutan",
    "iso2": "bt",
    "continent": "Asia"
  },
  {
    "city": "La Paz",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Anillo",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Aroma",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Bermejo",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Caracasa",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Cobija",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Cochabamba",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Cotoca",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Cruz",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Guayaramerin",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Oruro",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Riberalta",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Santa Cruz",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Sucre",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Tarija",
    "country": "Bolivia",
    "iso2": "bo",
    "continent": "Americas"
  },
  {
    "city": "Bonaire, Sint Eustatius and Saba",
    "country": "Bonaire, Sint Eustatius and Saba",
    "iso2": "bq",
    "continent": "Americas"
  },
  {
    "city": "Sarajevo",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Banja",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Banja Luka",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Bijeljina",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Bosanska Dubica",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Bosanska Krupa",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Brcko",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Breza",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Bugojno",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Cazin",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Core",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Doboj",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Donja Mahala",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Gracanica",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Ilidza",
    "country": "Bosnia and Herzegovina",
    "iso2": "ba",
    "continent": "Europe"
  },
  {
    "city": "Gaborone",
    "country": "Botswana",
    "iso2": "bw",
    "continent": "Africa"
  },
  {
    "city": "Francistown",
    "country": "Botswana",
    "iso2": "bw",
    "continent": "Africa"
  },
  {
    "city": "Orapa",
    "country": "Botswana",
    "iso2": "bw",
    "continent": "Africa"
  },
  {
    "city": "Serowe",
    "country": "Botswana",
    "iso2": "bw",
    "continent": "Africa"
  },
  {
    "city": "Village",
    "country": "Botswana",
    "iso2": "bw",
    "continent": "Africa"
  },
  {
    "city": "Bouvet Island",
    "country": "Bouvet Island",
    "iso2": "bv",
    "continent": "Americas"
  },
  {
    "city": "Brasília",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Rio de Janeiro",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Sao Paulo",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abadiania",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abaetetuba",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abelardo Luz",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abidos",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abrantes",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abreu",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Abreu e Lima",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Acarau",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Acopiara",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Acorizal",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Acu",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "Acucena",
    "country": "Brazil",
    "iso2": "br",
    "continent": "Americas"
  },
  {
    "city": "British Indian Ocean Territory",
    "country": "British Indian Ocean Territory",
    "iso2": "io",
    "continent": "Africa"
  },
  {
    "city": "Brunei Darussalam",
    "country": "Brunei Darussalam",
    "iso2": "bn",
    "continent": "Asia"
  },
  {
    "city": "Sofia",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Akhtopol",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Aksakovo",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Aleksandriya",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Alfatar",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Anton",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Antonovo",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Ardino",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Asenovgrad",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Aytos",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Babovo",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Baltchik",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Banite",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Bankya",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Bansko",
    "country": "Bulgaria",
    "iso2": "bg",
    "continent": "Europe"
  },
  {
    "city": "Ouagadougou",
    "country": "Burkina Faso",
    "iso2": "bf",
    "continent": "Africa"
  },
  {
    "city": "Bujumbura",
    "country": "Burundi",
    "iso2": "bi",
    "continent": "Africa"
  },
  {
    "city": "Cabo Verde",
    "country": "Cabo Verde",
    "iso2": "cv",
    "continent": "Africa"
  },
  {
    "city": "Phnom Penh",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Moung Roessei",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Boeng (1)",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Chhuk",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Preah Haoh",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Prei",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Prek Mrinh",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Siem Reab",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Thmei",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Thnal",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Phumi Vott Phnum",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Sihanoukville",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Tuol Kok",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Vott Kampong Svay",
    "country": "Cambodia",
    "iso2": "kh",
    "continent": "Asia"
  },
  {
    "city": "Yaounde",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Bafia",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Bafoussam",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Bamenda",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Buea",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Douala",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Kribi",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Kumba",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Ringo",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Tibati",
    "country": "Cameroon",
    "iso2": "cm",
    "continent": "Africa"
  },
  {
    "city": "Toronto",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Vancouver",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Montreal",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Calgary",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Ottawa",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Quebec City",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Edmonton",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "100 Mile House",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Abbey",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Abbotsford",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Acadia Valley",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Acme",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Acton",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Acton Vale",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "Agassiz",
    "country": "Canada",
    "iso2": "ca",
    "continent": "Americas"
  },
  {
    "city": "George Town",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "Bodden Town",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "Coral Gables",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "Newlands",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "Savannah",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "Spot Bay",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "West Bay",
    "country": "Cayman Islands",
    "iso2": "ky",
    "continent": "Americas"
  },
  {
    "city": "Bangui",
    "country": "Central African Republic",
    "iso2": "cf",
    "continent": "Africa"
  },
  {
    "city": "N'Djamena",
    "country": "Chad",
    "iso2": "td",
    "continent": "Africa"
  },
  {
    "city": "Santiago de Chile",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Algarrobo",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Angol",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Antofagasta",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Apoquindo",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Arauco",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Arica",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Buin",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Bulnes",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Calama",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Caldera",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Castro",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Catemu",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Centro",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Cerrillos de Tamaya",
    "country": "Chile",
    "iso2": "cl",
    "continent": "Americas"
  },
  {
    "city": "Peking",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Beijing",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Shanghai",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Guangzhou",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Shenzhen",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Chengdu",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Hong Kong",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Macau",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Aishang",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Aizhou",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Aksu",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Anbang",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Anbu",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Ancheng",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Anda",
    "country": "China",
    "iso2": "cn",
    "continent": "Asia"
  },
  {
    "city": "Flying Fish Cove",
    "country": "Christmas Island",
    "iso2": "cx",
    "continent": "Oceania"
  },
  {
    "city": "West Island",
    "country": "Cocos (Keeling) Islands",
    "iso2": "cc",
    "continent": "Oceania"
  },
  {
    "city": "Bogota",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Acacias",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Acevedo",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Aguachica",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Antioquia",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Arauca",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Armenia",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Atlantico",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Barrancabermeja",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Barranquilla",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Bello",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Bermudez",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Boyaca",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Bucaramanga",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Buenaventura",
    "country": "Colombia",
    "iso2": "co",
    "continent": "Americas"
  },
  {
    "city": "Moroni",
    "country": "Comoros",
    "iso2": "km",
    "continent": "Africa"
  },
  {
    "city": "Brazzaville",
    "country": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "city": "Banana",
    "country": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "city": "Goma",
    "country": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "city": "Kinshasa",
    "country": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "city": "Likasi",
    "country": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "city": "Lubumbashi",
    "country": "Congo",
    "iso2": "cg",
    "continent": "Africa"
  },
  {
    "city": "DR Congo",
    "country": "DR Congo",
    "iso2": "cd",
    "continent": "Africa"
  },
  {
    "city": "Avarua",
    "country": "Cook Islands",
    "iso2": "ck",
    "continent": "Oceania"
  },
  {
    "city": "San José",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Alajuela",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Alajuelita",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Alfaro",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Aserri",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Atenas",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Barva",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Cartago",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Colon",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Corazon de Jesus",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Coronado",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Coyol",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Curridabat",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Desamparados",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Escazu",
    "country": "Costa Rica",
    "iso2": "cr",
    "continent": "Americas"
  },
  {
    "city": "Côte d'Ivoire",
    "country": "Côte d'Ivoire",
    "iso2": "ci",
    "continent": "Africa"
  },
  {
    "city": "Zagreb",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Antunovac",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Baska",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Baska Voda",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bedekovcina",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bestovje",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Betina",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bibinje",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bizovac",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bjelovar",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bracevci",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Brdovec",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Bregana",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Brela",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "Brsadin",
    "country": "Croatia",
    "iso2": "hr",
    "continent": "Europe"
  },
  {
    "city": "La Habana",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Bayamo",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Cienfuegos",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Habana",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Havana",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Las Tunas",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Matanzas",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Santiago de Cuba",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Varadero",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Villa",
    "country": "Cuba",
    "iso2": "cu",
    "continent": "Americas"
  },
  {
    "city": "Curaçao",
    "country": "Curaçao",
    "iso2": "cw",
    "continent": "Americas"
  },
  {
    "city": "Nicosia",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Agia Anna",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Aradippou",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Ayia Marina",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Chlorakas",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Deryneia",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Famagusta",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Geroskipou",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Kato Lakatamia",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Kato Polemidia",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Kiti",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Kyrenia",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Larnaca",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Laxia",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Limassol",
    "country": "Cyprus",
    "iso2": "cy",
    "continent": "Asia"
  },
  {
    "city": "Czechia",
    "country": "Czechia",
    "iso2": "cz",
    "continent": "Europe"
  },
  {
    "city": "Copenhagen",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Aabenraa",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Aabybro",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Aalborg",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Aarhus",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Aars",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Abyhoj",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Agedrup",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Agerbaek",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Agerskov",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Akirkeby",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Albaek",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Albertslund",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Ale",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Alestrup",
    "country": "Denmark",
    "iso2": "dk",
    "continent": "Europe"
  },
  {
    "city": "Djibouti",
    "country": "Djibouti",
    "iso2": "dj",
    "continent": "Africa"
  },
  {
    "city": "Roseau",
    "country": "Dominica",
    "iso2": "dm",
    "continent": "Americas"
  },
  {
    "city": "Santo Domingo de Guzm",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Arenazo",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Bavaro",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Boca Chica",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Cabarete",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Cotui",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Dominica",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Guaricano",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Hato Mayor del Rey",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Jimani",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "La Romana",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Los Alcarrizos",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Los Prados",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Moca",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Pedernales",
    "country": "Dominican Republic",
    "iso2": "do",
    "continent": "Americas"
  },
  {
    "city": "Quito",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Ambato",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Atacames",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Atuntaqui",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Bahia de Caraquez",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Banos",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Calderon",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Cayambe",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Cuenca",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Daule",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "El Carmen",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "El Naranjal",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Esmeraldas",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Florida",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "General Leonidas Plaza Gutierrez",
    "country": "Ecuador",
    "iso2": "ec",
    "continent": "Americas"
  },
  {
    "city": "Cairo",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Alexandria",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Giza",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Sharm El Sheikh",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Hurghada",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Luxor",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Abu Hammad",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Al Mahallah al Kubra",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Al Mansurah",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Al Marj",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Almazah",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Ar Rawdah",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Assiut",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Az Zamalik",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "Badr",
    "country": "Egypt",
    "iso2": "eg",
    "continent": "Africa"
  },
  {
    "city": "San Salvador",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Ahuachapan",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Antiguo Cuscatlan",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Apaneca",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Apopa",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Ayutuxtepeque",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Botoncillal El Botoncillo",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Coatepeque",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Colon",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Colonia Escalon",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Cuscatancingo",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Delgado",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Gigante",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Guazapa",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Ilopango",
    "country": "El Salvador",
    "iso2": "sv",
    "continent": "Americas"
  },
  {
    "city": "Malabo",
    "country": "Equatorial Guinea",
    "iso2": "gq",
    "continent": "Africa"
  },
  {
    "city": "Asmara",
    "country": "Eritrea",
    "iso2": "er",
    "continent": "Africa"
  },
  {
    "city": "Tallinn",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Aasmae",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Aaviku",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Aespa",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Ahtma",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Alliku",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Ambla",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Antsla",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Ardu",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Avinurme",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Elva",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Emmaste",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Haabneeme",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Haage",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Haapsalu",
    "country": "Estonia",
    "iso2": "ee",
    "continent": "Europe"
  },
  {
    "city": "Mbabane",
    "country": "Eswatini",
    "iso2": "sz",
    "continent": "Africa"
  },
  {
    "city": "Kwaluseni",
    "country": "Eswatini",
    "iso2": "sz",
    "continent": "Africa"
  },
  {
    "city": "Lobamba",
    "country": "Eswatini",
    "iso2": "sz",
    "continent": "Africa"
  },
  {
    "city": "Manzini",
    "country": "Eswatini",
    "iso2": "sz",
    "continent": "Africa"
  },
  {
    "city": "Piggs Peak",
    "country": "Eswatini",
    "iso2": "sz",
    "continent": "Africa"
  },
  {
    "city": "Addis Abeba",
    "country": "Ethiopia",
    "iso2": "et",
    "continent": "Africa"
  },
  {
    "city": "Falkland Islands (Malvinas)",
    "country": "Falkland Islands (Malvinas)",
    "iso2": "fk",
    "continent": "Americas"
  },
  {
    "city": "Tórshavn",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Argir",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Glyvrar",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Hvalba",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Innan Glyvur",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Leirvik",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Saltangara",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Signabour",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Strendur",
    "country": "Faroe Islands",
    "iso2": "fo",
    "continent": "Europe"
  },
  {
    "city": "Fiji",
    "country": "Fiji",
    "iso2": "fj",
    "continent": "Oceania"
  },
  {
    "city": "Helsinki [Helsingfors]",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Aapajoki",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Aavasaksa",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Aitoo",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Akaa",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Alastaro",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Alaveteli",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Alavieska",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Alavus",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Alvettula",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Angelniemi",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Anjala",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Anttila",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Askola",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Aura",
    "country": "Finland",
    "iso2": "fi",
    "continent": "Europe"
  },
  {
    "city": "Paris",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Nice",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Lyon",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Marseille",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Bordeaux",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Cannes",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Strasbourg",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Aast",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abancourt",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abbans-Dessus",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abbaretz",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abbecourt",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abbeville",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abbeville-les-Conflans",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Abeilhan",
    "country": "France",
    "iso2": "fr",
    "continent": "Europe"
  },
  {
    "city": "Cayenne",
    "country": "French Guiana",
    "iso2": "gf",
    "continent": "Americas"
  },
  {
    "city": "Papeete",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "Arue",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "Faaa",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "Mahina",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "Paeau",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "Pirae",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "Punaauia",
    "country": "French Polynesia",
    "iso2": "pf",
    "continent": "Oceania"
  },
  {
    "city": "French Southern Territories",
    "country": "French Southern Territories",
    "iso2": "tf",
    "continent": "Africa"
  },
  {
    "city": "Libreville",
    "country": "Gabon",
    "iso2": "ga",
    "continent": "Africa"
  },
  {
    "city": "Gamba",
    "country": "Gabon",
    "iso2": "ga",
    "continent": "Africa"
  },
  {
    "city": "Mamagnia",
    "country": "Gabon",
    "iso2": "ga",
    "continent": "Africa"
  },
  {
    "city": "Moanda",
    "country": "Gabon",
    "iso2": "ga",
    "continent": "Africa"
  },
  {
    "city": "Port-Gentil",
    "country": "Gabon",
    "iso2": "ga",
    "continent": "Africa"
  },
  {
    "city": "Banjul",
    "country": "Gambia",
    "iso2": "gm",
    "continent": "Africa"
  },
  {
    "city": "Tbilisi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Batumi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Gogolesubani",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Kutaisi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Lentekhi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Qazbegi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Samtredia",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Sukhumi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Zemo-Avchala",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Zugdidi",
    "country": "Georgia",
    "iso2": "ge",
    "continent": "Asia"
  },
  {
    "city": "Berlin",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Munich",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Frankfurt",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Hamburg",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Cologne",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Aach",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Aachen",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Aalen",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abbensen",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abberode",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abenberg",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abensberg",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abstatt",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abtsbessingen",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Abtsgmuend",
    "country": "Germany",
    "iso2": "de",
    "continent": "Europe"
  },
  {
    "city": "Accra",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Bawku",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Berekum",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Bolgatanga",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Cape Coast",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Home",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Koforidua",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Kumasi",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Legon",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Mampong",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Navrongo",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Sunyani",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Takoradi",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Tema",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Wa",
    "country": "Ghana",
    "iso2": "gh",
    "continent": "Africa"
  },
  {
    "city": "Gibraltar",
    "country": "Gibraltar",
    "iso2": "gi",
    "continent": "Europe"
  },
  {
    "city": "Athenai",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Athens",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Santorini",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Mykonos",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Aegina",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Agioi Anargyroi",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Agios Nikolaos",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Agrinio",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Aigaleo",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Aigio",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Alexandreia",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Alexandroupoli",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Aliartos",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Alimos",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Amaliada",
    "country": "Greece",
    "iso2": "gr",
    "continent": "Europe"
  },
  {
    "city": "Nuuk",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Aasiaat",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Ilulissat",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Kapisillit",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Maniitsoq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Narsaq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Narsarsuaq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Nuussuaq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Paamiut",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Qaqortoq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Qasigiannguit",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Qeqertarsuaq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Qeqertat",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Sisimiut",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Tasiilaq",
    "country": "Greenland",
    "iso2": "gl",
    "continent": "Americas"
  },
  {
    "city": "Saint George's",
    "country": "Grenada",
    "iso2": "gd",
    "continent": "Americas"
  },
  {
    "city": "Basse-Terre",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Anse-Bertrand",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Baie Mahault",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Baie-Mahault",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Baillif",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Capesterre-Belle-Eau",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Capesterre-de-Marie-Galante",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Deshaies",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Gourbeyre",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Goyave",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Grand-Bourg",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Lamentin",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Le Gosier",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Le Moule",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Les Abymes",
    "country": "Guadeloupe",
    "iso2": "gp",
    "continent": "Americas"
  },
  {
    "city": "Aga",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Barrigada Village",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Dededo Village",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Inarajan Village",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Santa Rita",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Tamuning-Tumon-Harmon Village",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Yigo Village",
    "country": "Guam",
    "iso2": "gu",
    "continent": "Oceania"
  },
  {
    "city": "Ciudad de Guatemala",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Antigua Guatemala",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Cambote",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Catarina",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Central",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Chimaltenango",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Chiquimula",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Ciudad Vieja",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Coban",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "El Limon",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "El Naranjo",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "El Salvador",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Escuintla",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Esquipulas",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Flores",
    "country": "Guatemala",
    "iso2": "gt",
    "continent": "Americas"
  },
  {
    "city": "Guernsey",
    "country": "Guernsey",
    "iso2": "gg",
    "continent": "Europe"
  },
  {
    "city": "Conakry",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Dabola",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Kalia",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Kankan",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Lola",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Mamou",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Port Kamsar",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Sangaredi",
    "country": "Guinea",
    "iso2": "gn",
    "continent": "Africa"
  },
  {
    "city": "Bissau",
    "country": "Guinea-Bissau",
    "iso2": "gw",
    "continent": "Africa"
  },
  {
    "city": "Georgetown",
    "country": "Guyana",
    "iso2": "gy",
    "continent": "Americas"
  },
  {
    "city": "Port-au-Prince",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Carrefour",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Delmar",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Duverger",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Jacmel",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Masseau",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Moise",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Petionville",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Prince",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Turgeau",
    "country": "Haiti",
    "iso2": "ht",
    "continent": "Americas"
  },
  {
    "city": "Heard Island and McDonald Islands",
    "country": "Heard Island and McDonald Islands",
    "iso2": "hm",
    "continent": "Oceania"
  },
  {
    "city": "Holy See",
    "country": "Holy See",
    "iso2": "va",
    "continent": "Europe"
  },
  {
    "city": "Tegucigalpa",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Choloma",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Comayagua",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Comayaguela",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Coxen Hole",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "El Barro",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "El Paraiso",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "El Progreso",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "La Ceiba",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "La Hacienda",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Morazan",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Nacaome",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Pinalejo",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Piraera",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Puerto Lempira",
    "country": "Honduras",
    "iso2": "hn",
    "continent": "Americas"
  },
  {
    "city": "Victoria",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Aberdeen",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Causeway Bay",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Central District",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Cha Kwo Ling",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Chai Wan Kok",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Chek Chue",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Cheung Kong",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Cheung Sha Wan",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Chuen Lung",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Chung Hau",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Fa Yuen",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Fanling",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Fo Tan",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Happy Valley",
    "country": "Hong Kong",
    "iso2": "hk",
    "continent": "Asia"
  },
  {
    "city": "Budapest",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Abaujszanto",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Abda",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Abony",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Acs",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Acsa",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Adacs",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Adony",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Agard",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Ajak",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Ajka",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Alap",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Albertirsa",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Almasfuzito",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Almaskamaras",
    "country": "Hungary",
    "iso2": "hu",
    "continent": "Europe"
  },
  {
    "city": "Reykjavík",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Akranes",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Akureyri",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Borgarnes",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Dalvik",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Grindavik",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Hella",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Holmavik",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Husavik",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Hvammstangi",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Hveragerdi",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Hvolsvollur",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Kopavogur",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Reykjavik",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "Selfoss",
    "country": "Iceland",
    "iso2": "is",
    "continent": "Europe"
  },
  {
    "city": "New Delhi",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Mumbai",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Kolkata",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Bengaluru",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Chennai",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Hyderabad",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Jaipur",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Agra",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Goa",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Kochi",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Varanasi",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Srinagar (Kashmir)",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Abdul",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Adilabad",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Adwani",
    "country": "India",
    "iso2": "in",
    "continent": "Asia"
  },
  {
    "city": "Bali (Denpasar)",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Jakarta",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Surabaya",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Yogyakarta",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Lombok",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Abadi",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Adiantorop",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Airmadidi",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Ambarawa",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Ambon City",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Amlapura",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Anggrek",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Angkasa",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Area",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Badung",
    "country": "Indonesia",
    "iso2": "id",
    "continent": "Asia"
  },
  {
    "city": "Tehran",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "`Aliabad",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "`Aliabad-e Aq Hesar",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "`Oryan",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Abadan",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Abol",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Ahvaz",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Amlash",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Amol",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Arak",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Ardabil",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Ardakan",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Arnan",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Arsanjan",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Asadabad",
    "country": "Iran",
    "iso2": "ir",
    "continent": "Asia"
  },
  {
    "city": "Baghdad",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Al `Amarah",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Al Hillah",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Bahr",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Basere",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Basra",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Erbil",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Haji Hasan",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Hayat",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Karkh",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Kirkuk",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Manawi",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Mosul",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Najaf",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Sulaymaniyah",
    "country": "Iraq",
    "iso2": "iq",
    "continent": "Asia"
  },
  {
    "city": "Dublin",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Abbeyfeale",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Abbeyleix",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Ardee",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Arklow",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Artane",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Ashbourne",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Athboy",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Athenry",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Athlone",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Athy",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Bagenalstown",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Bailieborough",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Balbriggan",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Baldoyle",
    "country": "Ireland",
    "iso2": "ie",
    "continent": "Europe"
  },
  {
    "city": "Ballasalla",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Castletown",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Crosby",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Dalby",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Douglas",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Foxdale",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Laxey",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Onchan",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Peel",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Port Erin",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Port Saint Mary",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Ramsey",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Saint Johns",
    "country": "Isle of Man",
    "iso2": "im",
    "continent": "Europe"
  },
  {
    "city": "Jerusalem",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`Alma",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`Amir",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`Arugot",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`Aseret",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`En Ayyala",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`En HaShelosha",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "`Evron",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Acre",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Afiqim",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Ahituv",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Allonim",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Ashdod",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Ashqelon",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Azor",
    "country": "Israel",
    "iso2": "il",
    "continent": "Asia"
  },
  {
    "city": "Roma",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Rome",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Milan",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Venice",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Florence",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Naples",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Amalfi Coast",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Abano Terme",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Abbadia Lariana",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Abbadia San Salvatore",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Abbasanta",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Abbiategrasso",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Abetone",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Acate",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Acerno",
    "country": "Italy",
    "iso2": "it",
    "continent": "Europe"
  },
  {
    "city": "Kingston",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Black River",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Browns Town",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Gordon Town",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Gregory Park",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Mandeville",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "May Pen",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Moneague",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Montego Bay",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Negril",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Ocho Rios",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Old Harbour",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Port Maria",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Portland Cottage",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Portmore",
    "country": "Jamaica",
    "iso2": "jm",
    "continent": "Americas"
  },
  {
    "city": "Tokyo",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Kyoto",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Osaka",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Sapporo",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Hiroshima",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Fukuoka",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Nagoya",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Nara",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Abashiri",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Abiko",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Abira",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Aboshiku-okinohama",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Agano",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Agena",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Ageo",
    "country": "Japan",
    "iso2": "jp",
    "continent": "Asia"
  },
  {
    "city": "Jersey",
    "country": "Jersey",
    "iso2": "je",
    "continent": "Europe"
  },
  {
    "city": "Amman",
    "country": "Jordan",
    "iso2": "jo",
    "continent": "Asia"
  },
  {
    "city": "Petra",
    "country": "Jordan",
    "iso2": "jo",
    "continent": "Asia"
  },
  {
    "city": "Almaty",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Astana",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Aksay",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Aksoran",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Aqtas",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Aqtau",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Atyrau",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Baikonur",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Dostyk",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Dzhezkazgan",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Ekibastuz",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Esil",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Karagandy",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Kazakh",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Kentau",
    "country": "Kazakhstan",
    "iso2": "kz",
    "continent": "Asia"
  },
  {
    "city": "Nairobi",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Mombasa",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Bondo",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Chuka",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Eldoret",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kabete",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kaiboi",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Karatina",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kiambu",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kikuyu",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kisii",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kisumu",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kitale",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Kitui",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Machakos",
    "country": "Kenya",
    "iso2": "ke",
    "continent": "Africa"
  },
  {
    "city": "Bairiki",
    "country": "Kiribati",
    "iso2": "ki",
    "continent": "Oceania"
  },
  {
    "city": "Pyongyang",
    "country": "North Korea",
    "iso2": "kp",
    "continent": "Asia"
  },
  {
    "city": "Seoul",
    "country": "South Korea",
    "iso2": "kr",
    "continent": "Asia"
  },
  {
    "city": "Busan",
    "country": "South Korea",
    "iso2": "kr",
    "continent": "Asia"
  },
  {
    "city": "Jeju Island",
    "country": "South Korea",
    "iso2": "kr",
    "continent": "Asia"
  },
  {
    "city": "Kuwait",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Kuwait City",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Abraq Khaytan",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Ad Dasmah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Ad Dawhah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Al Ahmadi",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Al Farwaniyah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Al Shamiya",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Ar Rawdah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "As Salimiyah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Ash Shu`aybah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Ash Shuwaykh",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Bayan",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Hawalli",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Janub as Surrah",
    "country": "Kuwait",
    "iso2": "kw",
    "continent": "Asia"
  },
  {
    "city": "Bishkek",
    "country": "Kyrgyzstan",
    "iso2": "kg",
    "continent": "Asia"
  },
  {
    "city": "Vientiane",
    "country": "Laos",
    "iso2": "la",
    "continent": "Asia"
  },
  {
    "city": "Riga",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Adazi",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Agenskalns",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Aizkraukle",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Aizpute",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Baldone",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Balvi",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Bauska",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Brankas",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Carnikava",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Centrs",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Daugavpils",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Dobele",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Durbe",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Gulbene",
    "country": "Latvia",
    "iso2": "lv",
    "continent": "Europe"
  },
  {
    "city": "Beirut",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Aaley",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Adma",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Ashrafiye",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Baabda",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Baalbek",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Broummana",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Bsalim",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Chekka",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Dbaiye",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Dik el Mehdi",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Halba",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Hboub",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Sarba",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Sidon",
    "country": "Lebanon",
    "iso2": "lb",
    "continent": "Asia"
  },
  {
    "city": "Maseru",
    "country": "Lesotho",
    "iso2": "ls",
    "continent": "Africa"
  },
  {
    "city": "Monrovia",
    "country": "Liberia",
    "iso2": "lr",
    "continent": "Africa"
  },
  {
    "city": "Tripoli",
    "country": "Libya",
    "iso2": "ly",
    "continent": "Africa"
  },
  {
    "city": "Benghazi",
    "country": "Libya",
    "iso2": "ly",
    "continent": "Africa"
  },
  {
    "city": "Misratah",
    "country": "Libya",
    "iso2": "ly",
    "continent": "Africa"
  },
  {
    "city": "Sabha",
    "country": "Libya",
    "iso2": "ly",
    "continent": "Africa"
  },
  {
    "city": "Zliten",
    "country": "Libya",
    "iso2": "ly",
    "continent": "Africa"
  },
  {
    "city": "Vaduz",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Balzers",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Bendern",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Eschen",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Gamprin",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Mauren",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Nendeln",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Planken",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Ruggell",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Schaan",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Schaanwald",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Schellenberg",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Triesen",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Triesenberg",
    "country": "Liechtenstein",
    "iso2": "li",
    "continent": "Europe"
  },
  {
    "city": "Vilnius",
    "country": "Lithuania",
    "iso2": "lt",
    "continent": "Europe"
  },
  {
    "city": "Luxembourg [Luxemburg/L",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Ahn",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Alzingen",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Bascharage",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Beaufort",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Beckerich",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Beggen",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Beidweiler",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Belvaux",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Berchem",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Bereldange",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Bergem",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Bertrange",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Bettembourg",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Betzdorf",
    "country": "Luxembourg",
    "iso2": "lu",
    "continent": "Europe"
  },
  {
    "city": "Macao",
    "country": "Macao",
    "iso2": "mo",
    "continent": "Asia"
  },
  {
    "city": "Antananarivo",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Ambanja",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Antsirabe",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Antsiranana",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Fianarantsoa",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Toamasina",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Toliara",
    "country": "Madagascar",
    "iso2": "mg",
    "continent": "Africa"
  },
  {
    "city": "Lilongwe",
    "country": "Malawi",
    "iso2": "mw",
    "continent": "Africa"
  },
  {
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Penang",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Langkawi",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Melaka",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Johor Bahru",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Kota Kinabalu",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Kuching",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Ipoh",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Gentings Highlands",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Alor Gajah",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Alor Star",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Ampang",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Ayer Itam",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Ayer Tawar",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Bachok",
    "country": "Malaysia",
    "iso2": "my",
    "continent": "Asia"
  },
  {
    "city": "Male",
    "country": "Maldives",
    "iso2": "mv",
    "continent": "Asia"
  },
  {
    "city": "Hulhumale",
    "country": "Maldives",
    "iso2": "mv",
    "continent": "Asia"
  },
  {
    "city": "Maafushi",
    "country": "Maldives",
    "iso2": "mv",
    "continent": "Asia"
  },
  {
    "city": "Bamako",
    "country": "Mali",
    "iso2": "ml",
    "continent": "Africa"
  },
  {
    "city": "Valletta",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Attard",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Balzan",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Bingemma",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Birgu",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Birkirkara",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Bugibba",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Cospicua",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Dingli",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Fgura",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Floriana",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Fontana",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Ghajnsielem",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Gharb",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Ghasri",
    "country": "Malta",
    "iso2": "mt",
    "continent": "Europe"
  },
  {
    "city": "Dalap-Uliga-Darrit",
    "country": "Marshall Islands",
    "iso2": "mh",
    "continent": "Oceania"
  },
  {
    "city": "Fort-de-France",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Case-Pilote",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Ducos",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Carbet",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Diamant",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Francois",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Gros-Morne",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Lamentin",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Morne-Rouge",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Le Robert",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Les Trois-Ilets",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Riviere-Salee",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Saint-Esprit",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Saint-Joseph",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Sainte-Anne",
    "country": "Martinique",
    "iso2": "mq",
    "continent": "Americas"
  },
  {
    "city": "Nouakchott",
    "country": "Mauritania",
    "iso2": "mr",
    "continent": "Africa"
  },
  {
    "city": "Port-Louis",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Beau Bassin",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Chemin Grenier",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Ebene CyberCity",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Floreal",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Goodlands",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Le Reduit",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Port Louis",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Port Mathurin",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Quatre Bornes",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Rose Hill",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Saint Jean",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Tamarin",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Vacoas",
    "country": "Mauritius",
    "iso2": "mu",
    "continent": "Africa"
  },
  {
    "city": "Mamoutzou",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Bandaboa",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Chiconi",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Combani",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Dzaoudzi",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Dzoumonye",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Koungou",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Mamoudzou",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Ouangani",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Pamandzi",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Sada",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Tsingoni",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Tsoundzou 1",
    "country": "Mayotte",
    "iso2": "yt",
    "continent": "Africa"
  },
  {
    "city": "Ciudad de M",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Mexico City",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Cancun",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Abasolo",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acambaro",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acambay",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acapulco",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acatic",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acatlan de Perez Figueroa",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acatzingo de Hidalgo",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acolman",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Actopan",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Acuna",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Adolfo Lopez Mateos",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Adolfo Ruiz Cortines",
    "country": "Mexico",
    "iso2": "mx",
    "continent": "Americas"
  },
  {
    "city": "Palikir",
    "country": "Micronesia, Federated States of",
    "iso2": "fm",
    "continent": "Oceania"
  },
  {
    "city": "Chisinau",
    "country": "Moldova",
    "iso2": "md",
    "continent": "Europe"
  },
  {
    "city": "Monaco-Ville",
    "country": "Monaco",
    "iso2": "mc",
    "continent": "Europe"
  },
  {
    "city": "Ulan Bator",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Altai",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Arvayheer",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Baruun-Urt",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Bayangol",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Bayanhongor",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Cecerleg",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Chihertey",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Choyr",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Dalandzadgad",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Darhan",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Han-Uul",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Javhlant",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Khovd",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Mandalgovi",
    "country": "Mongolia",
    "iso2": "mn",
    "continent": "Asia"
  },
  {
    "city": "Podgorica",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Budva",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Crna Gora",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Herceg Novi",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Igalo",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Kotor",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Niksic",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Pljevlja",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Stari Bar",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Ulcinj",
    "country": "Montenegro",
    "iso2": "me",
    "continent": "Europe"
  },
  {
    "city": "Plymouth",
    "country": "Montserrat",
    "iso2": "ms",
    "continent": "Americas"
  },
  {
    "city": "Rabat",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Marrakech",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Casablanca",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Afourer",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Agadir",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Ait Melloul",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Al Hoceima",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Assa",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Benguerir",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Beni Mellal",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Berrechid",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Deroua",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "El Gara",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "El Hajeb",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "El Jadida",
    "country": "Morocco",
    "iso2": "ma",
    "continent": "Africa"
  },
  {
    "city": "Maputo",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Beira",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Matola",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Mozambique",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Nampula",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Pemba",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Quelimane",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Tete",
    "country": "Mozambique",
    "iso2": "mz",
    "continent": "Africa"
  },
  {
    "city": "Rangoon (Yangon)",
    "country": "Myanmar",
    "iso2": "mm",
    "continent": "Asia"
  },
  {
    "city": "Windhoek",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Etunda",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Grootfontein",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Katima Mulilo",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Keetmanshoop",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Mpapuka",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Olympia",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Ondangwa",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Ongwediva",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Oranjemund",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Oshakati",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Otjiwarongo",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Outapi",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Swakopmund",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Tsumeb",
    "country": "Namibia",
    "iso2": "na",
    "continent": "Africa"
  },
  {
    "city": "Yaren",
    "country": "Nauru",
    "iso2": "nr",
    "continent": "Oceania"
  },
  {
    "city": "Kathmandu",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Pokhara",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Lalitpur",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Bharatpur",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Jawlakhel",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Lumbini",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Palpa",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Patan",
    "country": "Nepal",
    "iso2": "np",
    "continent": "Asia"
  },
  {
    "city": "Netherlands, Kingdom of the",
    "country": "Netherlands, Kingdom of the",
    "iso2": "nl",
    "continent": "Europe"
  },
  {
    "city": "Noum",
    "country": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "city": "Dumbea",
    "country": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "city": "Mont-Dore",
    "country": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "city": "Noumea",
    "country": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "city": "Nouville",
    "country": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "city": "Paita",
    "country": "New Caledonia",
    "iso2": "nc",
    "continent": "Oceania"
  },
  {
    "city": "Wellington",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Auckland",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Queenstown",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Ahaura",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Albany",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Amberley",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Ashhurst",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Avondale",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Awanui",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Balclutha",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Balfour",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Beachlands",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Belmont",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Bethlehem",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Blackburn",
    "country": "New Zealand",
    "iso2": "nz",
    "continent": "Oceania"
  },
  {
    "city": "Managua",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Bluefields",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Chinandega",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "El Panama",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Esteli",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Granada",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Jinotega",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Los Arados",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Masaya",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Matagalpa",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Ocotal",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Rivas",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "San Juan del Sur",
    "country": "Nicaragua",
    "iso2": "ni",
    "continent": "Americas"
  },
  {
    "city": "Niamey",
    "country": "Niger",
    "iso2": "ne",
    "continent": "Africa"
  },
  {
    "city": "Abuja",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Aba",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Abakaliki",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Abeokuta",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Abraka",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Ado-Ekiti",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Adodo",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Aganga",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Agege",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Agidingbi",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Ajegunle",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Ajuwon",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Akure",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Alimosho",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Anambra",
    "country": "Nigeria",
    "iso2": "ng",
    "continent": "Africa"
  },
  {
    "city": "Alofi",
    "country": "Niue",
    "iso2": "nu",
    "continent": "Oceania"
  },
  {
    "city": "Kingston",
    "country": "Norfolk Island",
    "iso2": "nf",
    "continent": "Oceania"
  },
  {
    "city": "Skopje",
    "country": "North Macedonia",
    "iso2": "mk",
    "continent": "Europe"
  },
  {
    "city": "Garapan",
    "country": "Northern Mariana Islands",
    "iso2": "mp",
    "continent": "Oceania"
  },
  {
    "city": "Oslo",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Abelvaer",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Adalsbruk",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Adland",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Agotnes",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Agskardet",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Aker",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Akkarfjord",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Akrehamn",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Al",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Alen",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Algard",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Almas",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Alta",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Alvdal",
    "country": "Norway",
    "iso2": "no",
    "continent": "Europe"
  },
  {
    "city": "Masqat",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Muscat",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Salalah",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Al Sohar",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Nizwa",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Ruwi",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Saham",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Samad",
    "country": "Oman",
    "iso2": "om",
    "continent": "Asia"
  },
  {
    "city": "Islamabad",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Karachi",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Lahore",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Abbottabad",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Attock",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Batgram",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Bhimbar",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Burewala",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Cantt",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Chakwal",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Clifton",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Daska",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Daud Khel",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Dera Ghazi Khan",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Faisalabad",
    "country": "Pakistan",
    "iso2": "pk",
    "continent": "Asia"
  },
  {
    "city": "Koror",
    "country": "Palau",
    "iso2": "pw",
    "continent": "Oceania"
  },
  {
    "city": "Palestine, State of",
    "country": "Palestine, State of",
    "iso2": "ps",
    "continent": "Asia"
  },
  {
    "city": "Ciudad de Panamá",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Aguadulce",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Albrook",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Ancon",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Arosemena",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Arraijan",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Balboa",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Bella Vista",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Bocas del Toro",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Boquete",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Bugaba",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Calidonia",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Campo Alegre",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Cerro Viento",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Chigore",
    "country": "Panama",
    "iso2": "pa",
    "continent": "Americas"
  },
  {
    "city": "Port Moresby",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Aitape",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Arawa",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Daru",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Goroka",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kavieng",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kerema",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kikori",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kimbe",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kiunga",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kokopo",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kundiawa",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Kupano",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Lae",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Lorengau",
    "country": "Papua New Guinea",
    "iso2": "pg",
    "continent": "Oceania"
  },
  {
    "city": "Asunción",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Ayolas",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Boqueron",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Chore",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Ciudad del Este",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Colonia Mariano Roque Alonso",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Coronel Oviedo",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Fernando de la Mora",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Fuerte Olimpo",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Hernandarias",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Hohenau",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Independencia",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "La Paz",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Limpio",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Loma Plata",
    "country": "Paraguay",
    "iso2": "py",
    "continent": "Americas"
  },
  {
    "city": "Lima",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Abancay",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Arequipa",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Ate",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Ayacucho",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Bagua",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Barranca",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Barranco",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Bellavista",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Bolivar",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Cajamarca",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Callao",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Calle",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Caras",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Cerro de Pasco",
    "country": "Peru",
    "iso2": "pe",
    "continent": "Americas"
  },
  {
    "city": "Manila",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Cebu",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Boracay",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Abucay",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Acacia",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Aguilar",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Agusan Pequeno",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Alabang",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Alaminos",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Alcala",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Alfonso",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Alitagtag",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Amadeo",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Angat",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Angeles City",
    "country": "Philippines",
    "iso2": "ph",
    "continent": "Asia"
  },
  {
    "city": "Adamstown",
    "country": "Pitcairn",
    "iso2": "pn",
    "continent": "Oceania"
  },
  {
    "city": "Warszawa",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Adama",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Alwernia",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Andrespol",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Andrychow",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Anin",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Annopol",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Arkadia",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Babienica",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Babimost",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Baborow",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Baboszewo",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Balice",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Banino",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Baniocha",
    "country": "Poland",
    "iso2": "pl",
    "continent": "Europe"
  },
  {
    "city": "Lisboa",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Lisbon",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Porto",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Abobada",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Abrantes",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Acores",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Aguada de Cima",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Agualva",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Agucadoura",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Aguiar da Beira Municipality",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Alandroal",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Albergaria-a-Velha",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Albufeira",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Alcabideche",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "Alcacer do Sal",
    "country": "Portugal",
    "iso2": "pt",
    "continent": "Europe"
  },
  {
    "city": "San Juan",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Adjuntas",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Aguada",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Aguadilla",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Aguas Buenas",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Aibonito",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Anasco",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Arecibo",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Arroyo",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Bajadero",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Barceloneta",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Barranquitas",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Boqueron",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Cabo Rojo",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Caguas",
    "country": "Puerto Rico",
    "iso2": "pr",
    "continent": "Americas"
  },
  {
    "city": "Doha",
    "country": "Qatar",
    "iso2": "qa",
    "continent": "Asia"
  },
  {
    "city": "Al Wakrah",
    "country": "Qatar",
    "iso2": "qa",
    "continent": "Asia"
  },
  {
    "city": "Réunion",
    "country": "Réunion",
    "iso2": "re",
    "continent": "Africa"
  },
  {
    "city": "Bucuresti",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Adjud",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Afumati",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Agnita",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Aiud",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Alba",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Alba Iulia",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Albesti-Paleologu",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Alesd",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Alexandria",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Alunu",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Apahida",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Apata",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Arad",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Avrig",
    "country": "Romania",
    "iso2": "ro",
    "continent": "Europe"
  },
  {
    "city": "Moscow",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Saint Petersburg",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Abakan",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Abinsk",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Achinsk",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Adygeysk",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Agapovka",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Agidel",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Akhtubinsk",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Aksay",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Aksenovo",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Alapayevsk",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Aldan",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Aleksandrov",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Aleksandrovka",
    "country": "Russia",
    "iso2": "ru",
    "continent": "Europe"
  },
  {
    "city": "Kigali",
    "country": "Rwanda",
    "iso2": "rw",
    "continent": "Africa"
  },
  {
    "city": "Saint Barthélemy",
    "country": "Saint Barthélemy",
    "iso2": "bl",
    "continent": "Americas"
  },
  {
    "city": "Saint Helena, Ascension and Tristan da Cunha",
    "country": "Saint Helena, Ascension and Tristan da Cunha",
    "iso2": "sh",
    "continent": "Africa"
  },
  {
    "city": "Basseterre",
    "country": "Saint Kitts and Nevis",
    "iso2": "kn",
    "continent": "Americas"
  },
  {
    "city": "Castries",
    "country": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "city": "Anse La Raye",
    "country": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "city": "Choiseul",
    "country": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "city": "Dauphin",
    "country": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "city": "Gros Islet",
    "country": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "city": "Vieux Fort",
    "country": "Saint Lucia",
    "iso2": "lc",
    "continent": "Americas"
  },
  {
    "city": "Saint Martin (French part)",
    "country": "Saint Martin (French part)",
    "iso2": "mf",
    "continent": "Americas"
  },
  {
    "city": "Saint-Pierre",
    "country": "Saint Pierre and Miquelon",
    "iso2": "pm",
    "continent": "Americas"
  },
  {
    "city": "Kingstown",
    "country": "Saint Vincent and the Grenadines",
    "iso2": "vc",
    "continent": "Americas"
  },
  {
    "city": "Apia",
    "country": "Samoa",
    "iso2": "ws",
    "continent": "Oceania"
  },
  {
    "city": "San Marino",
    "country": "San Marino",
    "iso2": "sm",
    "continent": "Europe"
  },
  {
    "city": "Acquaviva",
    "country": "San Marino",
    "iso2": "sm",
    "continent": "Europe"
  },
  {
    "city": "Falciano",
    "country": "San Marino",
    "iso2": "sm",
    "continent": "Europe"
  },
  {
    "city": "Fiorentino",
    "country": "San Marino",
    "iso2": "sm",
    "continent": "Europe"
  },
  {
    "city": "Serravalle",
    "country": "San Marino",
    "iso2": "sm",
    "continent": "Europe"
  },
  {
    "city": "São Tomé",
    "country": "Sao Tome and Principe",
    "iso2": "st",
    "continent": "Africa"
  },
  {
    "city": "Makkah",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Madinah",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Jeddah",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Dammam",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Khobar",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Taif",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Tabuk",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Abha",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Al Ula",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Abqaiq",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Al Bahah",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Al Faruq",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Al Hufuf",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Al Qatif",
    "country": "Saudi Arabia",
    "iso2": "sa",
    "continent": "Asia"
  },
  {
    "city": "Dakar",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Boussinki",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Camberene",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Dodji",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Guediawaye",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Kaolack",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Kedougou",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Louga",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Madina Kokoun",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Saint-Louis",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Sama",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Tanaf",
    "country": "Senegal",
    "iso2": "sn",
    "continent": "Africa"
  },
  {
    "city": "Belgrade",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Ada",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Aleksinac",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Apatin",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Arilje",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Avala",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Backa Topola",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Backi Jarak",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Backi Petrovac",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Backo Gradiste",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Banatsko Novo Selo",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Barajevo",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Basaid",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Batajnica",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Becej",
    "country": "Serbia",
    "iso2": "rs",
    "continent": "Europe"
  },
  {
    "city": "Victoria",
    "country": "Seychelles",
    "iso2": "sc",
    "continent": "Africa"
  },
  {
    "city": "Freetown",
    "country": "Sierra Leone",
    "iso2": "sl",
    "continent": "Africa"
  },
  {
    "city": "Singapore",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Ang Mo Kio New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Ayer Raja New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Bedok New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Boon Lay",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Bukit Batok New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Bukit Panjang New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Bukit Timah",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Bukit Timah Estate",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Changi Village",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Choa Chu Kang New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Clementi New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Holland Village",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Hougang",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Jurong East New Town",
    "country": "Singapore",
    "iso2": "sg",
    "continent": "Asia"
  },
  {
    "city": "Sint Maarten (Dutch part)",
    "country": "Sint Maarten (Dutch part)",
    "iso2": "sx",
    "continent": "Americas"
  },
  {
    "city": "Bratislava",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Bahon",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Baka",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Banovce nad Bebravou",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Bardejov",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Bela",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Beladice",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Bernolakovo",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Besenov",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Blatnica",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Bobrov",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Bohdanovce",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Boleraz",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Borovce",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Branc",
    "country": "Slovakia",
    "iso2": "sk",
    "continent": "Europe"
  },
  {
    "city": "Ljubljana",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Ankaran",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Begunje na Gorenjskem",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Beltinci",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Besnica",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Bevke",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Bistrica pri Rusah",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Bled",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Bohinjska Bela",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Borovnica",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Breginj",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Brestanica",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Breznica",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Cemsenik",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Cerklje ob Krki",
    "country": "Slovenia",
    "iso2": "si",
    "continent": "Europe"
  },
  {
    "city": "Honiara",
    "country": "Solomon Islands",
    "iso2": "sb",
    "continent": "Oceania"
  },
  {
    "city": "Mogadishu",
    "country": "Somalia",
    "iso2": "so",
    "continent": "Africa"
  },
  {
    "city": "Pretoria",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Cape Town",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Johannesburg",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Alberton",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Alice",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Alrode",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Amanzimtoti",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Ashton",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Atlantis",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Balfour",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Bathurst",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Beaufort West",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Bedfordview",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Belhar",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "Bellville",
    "country": "South Africa",
    "iso2": "za",
    "continent": "Africa"
  },
  {
    "city": "South Georgia and the South Sandwich Islands",
    "country": "South Georgia and the South Sandwich Islands",
    "iso2": "gs",
    "continent": "Americas"
  },
  {
    "city": "Juba",
    "country": "South Sudan",
    "iso2": "ss",
    "continent": "Africa"
  },
  {
    "city": "Madrid",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Barcelona",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Seville",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Valencia",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Malaga",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Mallorca",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Ibiza",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "A Cidade",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "A Estrada",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "A Pobra do Caraminal",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Abadino",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Abanilla",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Abanto",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Abaran",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Abegondo",
    "country": "Spain",
    "iso2": "es",
    "continent": "Europe"
  },
  {
    "city": "Colombo, Sri Jayawardenepura Kotte",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Colombo",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Kandy",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Galle",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Bentota",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Badulla",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Battaramulla South",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Biyagama",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Boralesgamuwa South",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Dehiwala",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Dehiwala-Mount Lavinia",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Eppawala",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Gampaha",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Gangodawila North",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Hekitta",
    "country": "Sri Lanka",
    "iso2": "lk",
    "continent": "Asia"
  },
  {
    "city": "Khartum",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Kassala",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Khartoum",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Nyala",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Shendi",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Thabit",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Umm Durman",
    "country": "Sudan",
    "iso2": "sd",
    "continent": "Africa"
  },
  {
    "city": "Paramaribo",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Botopasi",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Brownsweg",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Friendship",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Groningen",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Moengo",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Nieuw Amsterdam",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Onverwacht",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Totness",
    "country": "Suriname",
    "iso2": "sr",
    "continent": "Americas"
  },
  {
    "city": "Longyearbyen",
    "country": "Svalbard and Jan Mayen",
    "iso2": "sj",
    "continent": "Europe"
  },
  {
    "city": "Stockholm",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Aby",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "AElmhult",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "AElvdalen",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "AElvkarleby",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "AElvsbyn",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Agnesberg",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Agunnaryd",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Akarp",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Akers Styckebruk",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Akersberga",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Alafors",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Alandsbro",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Aled",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Alem",
    "country": "Sweden",
    "iso2": "se",
    "continent": "Europe"
  },
  {
    "city": "Bern",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Zurich",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Geneva",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Lucerne",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Interlaken",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Zermatt",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Basel",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Aadorf",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Aarau",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Aarberg",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Aarburg",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Abtwil",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Adelboden",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Adligenswil",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Adliswil",
    "country": "Switzerland",
    "iso2": "ch",
    "continent": "Europe"
  },
  {
    "city": "Damascus",
    "country": "Syria",
    "iso2": "sy",
    "continent": "Asia"
  },
  {
    "city": "Budai",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Caogang",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Chang-hua",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Checheng",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Chiayi",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Dahu",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Douliu",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Erlin",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Fanlu",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Fengshan",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Gangshan",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Gaozhongyicun",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Hemei",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Hengchun",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Hsinchu",
    "country": "Taiwan",
    "iso2": "tw",
    "continent": "World"
  },
  {
    "city": "Dushanbe",
    "country": "Tajikistan",
    "iso2": "tj",
    "continent": "Asia"
  },
  {
    "city": "Dodoma",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Zanzibar",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Dar es Salaam",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Arusha",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Bukoba",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Morogoro",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Mwanza",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Njombe",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Raha",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Tanga",
    "country": "Tanzania",
    "iso2": "tz",
    "continent": "Africa"
  },
  {
    "city": "Bangkok",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Phuket",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Chiang Mai",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Pattaya",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Krabi",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Koh Samui",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Hua Hin",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Ayutthaya",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Amnat Charoen",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Amphawa",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Amphoe Aranyaprathet",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Ang Thong",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Ban Ang Thong",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Ban Bang Phli Nakhon",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Ban Bang Plong",
    "country": "Thailand",
    "iso2": "th",
    "continent": "Asia"
  },
  {
    "city": "Timor-Leste",
    "country": "Timor-Leste",
    "iso2": "tl",
    "continent": "Asia"
  },
  {
    "city": "Lomé",
    "country": "Togo",
    "iso2": "tg",
    "continent": "Africa"
  },
  {
    "city": "Fakaofo",
    "country": "Tokelau",
    "iso2": "tk",
    "continent": "Oceania"
  },
  {
    "city": "Nuku'alofa",
    "country": "Tonga",
    "iso2": "to",
    "continent": "Oceania"
  },
  {
    "city": "Port-of-Spain",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Arima",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Arouca",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Barataria",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "California",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Carapichaima",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Carenage",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Caroni",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Chaguanas",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Claxton Bay",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Couva",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Cumuto",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Cunupia",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Curepe",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Debe",
    "country": "Trinidad and Tobago",
    "iso2": "tt",
    "continent": "Americas"
  },
  {
    "city": "Tunis",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Ariana",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Beja",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Gafsa",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Hammamet",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Le Bardo",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Manouba",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Monastir",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Rades",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Sfax",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Sidi Bouzid",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Sousse",
    "country": "Tunisia",
    "iso2": "tn",
    "continent": "Africa"
  },
  {
    "city": "Istanbul",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Antalya",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Ankara",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Izmir",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Cappadocia",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Bodrum",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Fethiye",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Bursa",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Trabzon",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Abdullah",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Acibadem",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Ada",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Adana",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Adnan Menderes",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Afyonkarahisar",
    "country": "Turkey",
    "iso2": "tr",
    "continent": "Asia"
  },
  {
    "city": "Ashgabat",
    "country": "Turkmenistan",
    "iso2": "tm",
    "continent": "Asia"
  },
  {
    "city": "Cockburn Town",
    "country": "Turks and Caicos Islands",
    "iso2": "tc",
    "continent": "Americas"
  },
  {
    "city": "Funafuti",
    "country": "Tuvalu",
    "iso2": "tv",
    "continent": "Oceania"
  },
  {
    "city": "Kampala",
    "country": "Uganda",
    "iso2": "ug",
    "continent": "Africa"
  },
  {
    "city": "Kyiv",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Aleksandriya",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Aleksandrovka",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Alekseyevo-Druzhkovka",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Alupka",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Alushta",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Babin",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Barashivka",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Baryshivka",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Belaya",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Berdychiv",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Berehove",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Bila Hora",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Bila Tserkva",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Bolekhiv",
    "country": "Ukraine",
    "iso2": "ua",
    "continent": "Europe"
  },
  {
    "city": "Dubai",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Abu Dhabi",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Sharjah",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Ajman",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Ras Al Khaimah",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Fujairah",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Al Ain",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Al Khan",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Ar Ruways",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "As Satwah",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Dayrah",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "Ras al-Khaimah",
    "country": "United Arab Emirates",
    "iso2": "ae",
    "continent": "Asia"
  },
  {
    "city": "London",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Manchester",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Birmingham",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Edinburgh",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Glasgow",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Liverpool",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Oxford",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Cambridge",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Bristol",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Cardiff",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Belfast",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Abberton",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Abbots Langley",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Aberaeron",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Aberchirder",
    "country": "United Kingdom",
    "iso2": "gb",
    "continent": "Europe"
  },
  {
    "city": "Washington",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "New York",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Los Angeles",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Chicago",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Miami",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "San Francisco",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Las Vegas",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Orlando",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Washington D.C.",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Boston",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Seattle",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Houston",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Dallas",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Atlanta",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "Honolulu (Hawaii)",
    "country": "United States",
    "iso2": "us",
    "continent": "Americas"
  },
  {
    "city": "United States Minor Outlying Islands",
    "country": "United States Minor Outlying Islands",
    "iso2": "um",
    "continent": "Oceania"
  },
  {
    "city": "Montevideo",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Barra de Carrasco",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Canelones",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Colonia del Sacramento",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Durazno",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Florida",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "La Floresta",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "La Paz",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Las Piedras",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Maldonado",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Mercedes",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Punta del Este",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Salto",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "San Carlos",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Toledo",
    "country": "Uruguay",
    "iso2": "uy",
    "continent": "Americas"
  },
  {
    "city": "Toskent",
    "country": "Uzbekistan",
    "iso2": "uz",
    "continent": "Asia"
  },
  {
    "city": "Tashkent",
    "country": "Uzbekistan",
    "iso2": "uz",
    "continent": "Asia"
  },
  {
    "city": "Samarkand",
    "country": "Uzbekistan",
    "iso2": "uz",
    "continent": "Asia"
  },
  {
    "city": "Bukhara",
    "country": "Uzbekistan",
    "iso2": "uz",
    "continent": "Asia"
  },
  {
    "city": "Port-Vila",
    "country": "Vanuatu",
    "iso2": "vu",
    "continent": "Oceania"
  },
  {
    "city": "Caracas",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Acarigua",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Anaco",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Araure",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Bachaquero",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Barcelona",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Barinas",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Barquisimeto",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Bejuma",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Bolivar",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Cabimas",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Cabudare",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Cagua",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Caja de Agua",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Calabozo",
    "country": "Venezuela",
    "iso2": "ve",
    "continent": "Americas"
  },
  {
    "city": "Hanoi",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Ho Chi Minh City",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Da Nang",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Hoi An",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "An Dinh",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "An Giang",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "An Nhon",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "An Tam",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "An Thanh",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Ap Sai Gon",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Ap Trung",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Bac Giang",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Bac Kan",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Bac Ninh",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Bach Ma",
    "country": "Vietnam",
    "iso2": "vn",
    "continent": "Asia"
  },
  {
    "city": "Virgin Islands (British)",
    "country": "Virgin Islands (British)",
    "iso2": "vg",
    "continent": "Americas"
  },
  {
    "city": "Virgin Islands (U.S.)",
    "country": "Virgin Islands (U.S.)",
    "iso2": "vi",
    "continent": "Americas"
  },
  {
    "city": "Mata-Utu",
    "country": "Wallis and Futuna",
    "iso2": "wf",
    "continent": "Oceania"
  },
  {
    "city": "El-Aai",
    "country": "Western Sahara",
    "iso2": "eh",
    "continent": "Africa"
  },
  {
    "city": "Sanaa",
    "country": "Yemen",
    "iso2": "ye",
    "continent": "Asia"
  },
  {
    "city": "Lusaka",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Kalomo",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Kitwe",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Livingstone",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Macha",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Mumbwa",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Ndola",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Siavonga",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Solwezi",
    "country": "Zambia",
    "iso2": "zm",
    "continent": "Africa"
  },
  {
    "city": "Harare",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Bulawayo",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Chinhoyi",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Greendale",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Gwanda",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Kwekwe",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Mufakose",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Mutare",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  },
  {
    "city": "Victoria Falls",
    "country": "Zimbabwe",
    "iso2": "zw",
    "continent": "Africa"
  }
];

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// 3. Precompiled In-Memory Index of Places
// ---------------------------------------------------------------------------
export const ALL_WORLD_PLACES: WorldPlace[] = [
  // 1. Countries
  ...WORLD_COUNTRIES.map((c) => ({
    name: c.name,
    country: c.name,
    continent: c.continent,
    iso2: c.iso2,
    flagUrl: getFlagUrl(c.iso2),
    isCity: false,
    slug: slug(c.name),
  })),

  // 2. Cities
  ...WORLD_CITIES.map((c) => ({
    name: c.city === c.country ? c.city : `${c.city}, ${c.country}`,
    cityName: c.city,
    country: c.country,
    continent: c.continent,
    iso2: c.iso2,
    flagUrl: getFlagUrl(c.iso2),
    isCity: true,
    slug: slug(`${c.city}-${c.country}`),
  })),
];

/**
 * Fast prefix & substring matching across all countries and cities.
 */
export function searchWorldPlaces(query: string, limit = 25): WorldPlace[] {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];

  const exactMatches: WorldPlace[] = [];
  const prefixMatches: WorldPlace[] = [];
  const containsMatches: WorldPlace[] = [];

  for (const p of ALL_WORLD_PLACES) {
    const nameLower = p.name.toLowerCase();
    const cityLower = (p.cityName || '').toLowerCase();
    const countryLower = p.country.toLowerCase();

    if (nameLower === q || cityLower === q || countryLower === q) {
      exactMatches.push(p);
    } else if (
      nameLower.startsWith(q) ||
      cityLower.startsWith(q) ||
      countryLower.startsWith(q)
    ) {
      prefixMatches.push(p);
    } else if (nameLower.includes(q)) {
      containsMatches.push(p);
    }
  }

  const results = [...exactMatches, ...prefixMatches, ...containsMatches];
  // Deduplicate by name
  const seen = new Set<string>();
  const deduped: WorldPlace[] = [];
  for (const item of results) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
      if (deduped.length >= limit) break;
    }
  }

  return deduped;
}
