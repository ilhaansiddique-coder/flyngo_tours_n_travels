// Central high-reliability image resolver for countries and destinations.
// Uses fast, curated Unsplash photography keyed deterministically to country names.
// Never flickers, loads in milliseconds globally, and never returns 401.

const COUNTRY_PHOTOS: Record<string, string> = {
  // Bangladesh & Domestic Destinations
  bangladesh: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809',
  dhaka: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809',
  coxsbazar: 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5',
  sylhet: 'https://images.unsplash.com/photo-1628085959954-d3a95db98a00',
  sreemangal: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b',
  chittagong: 'https://images.unsplash.com/photo-1582650625119-3a31f841839d',
  chattogram: 'https://images.unsplash.com/photo-1582650625119-3a31f841839d',
  saintmartin: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  stmartin: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  sundarbans: 'https://images.unsplash.com/photo-1544979590-37e9b47eb705',
  bandarban: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  rangamati: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
  kuakata: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
  sajek: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
  sajekvalley: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',

  // Saudi Arabia & Holy Pilgrimage Sites
  saudi: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  saudiarabia: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  makkah: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  mecca: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a',
  madinah: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa',
  medina: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa',
  jeddah: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6',
  riyadh: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6',

  // Middle East & Gulf
  uae: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  unitedarabemirates: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
  abudhabi: 'https://images.unsplash.com/photo-1518684079-3c830dcef090',
  sharjah: 'https://images.unsplash.com/photo-1578895210405-907db486c111',
  qatar: 'https://images.unsplash.com/photo-1578895210405-907db486c111',
  doha: 'https://images.unsplash.com/photo-1578895210405-907db486c111',
  oman: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee',
  muscat: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee',
  bahrain: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1',
  kuwait: 'https://images.unsplash.com/photo-1579606032833-2a70d8299b45',
  jordan: 'https://images.unsplash.com/photo-1579606032833-2a70d8299b45',
  petra: 'https://images.unsplash.com/photo-1579606032833-2a70d8299b45',
  egypt: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',
  cairo: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',
  alexandria: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',

  // Southeast Asia
  thailand: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365',
  phuket: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5',
  chiangmai: 'https://images.unsplash.com/photo-1528181304800-259b08848526',
  pattaya: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18',
  krabi: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
  malaysia: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07',
  kualalumpur: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07',
  langkawi: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f',
  penang: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07',
  singapore: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
  indonesia: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  jakarta: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af',
  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592',
  hanoi: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  hochiminh: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482',
  danang: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
  cambodia: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  siemreap: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  philippines: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86',
  manila: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86',
  boracay: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',

  // South Asia
  india: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
  newdelhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f',
  agra: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
  kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255',
  nepal: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
  kathmandu: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa',
  pokhara: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
  male: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8',
  srilanka: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe',
  colombo: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe',
  kandy: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe',
  bhutan: 'https://images.unsplash.com/photo-1578632767115-351597cf2477',

  // East Asia
  japan: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
  osaka: 'https://images.unsplash.com/photo-1590559899731-a382839e5549',
  southkorea: 'https://images.unsplash.com/photo-1538485399081-7191377e8241',
  korea: 'https://images.unsplash.com/photo-1538485399081-7191377e8241',
  seoul: 'https://images.unsplash.com/photo-1538485399081-7191377e8241',
  china: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
  beijing: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
  shanghai: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403',
  hongkong: 'https://images.unsplash.com/photo-1506970845246-18f21d533b20',
  taiwan: 'https://images.unsplash.com/photo-1508248467877-aec1b08de376',
  taipei: 'https://images.unsplash.com/photo-1508248467877-aec1b08de376',

  // Europe & Turkey
  turkey: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  istanbul: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  cappadocia: 'https://images.unsplash.com/photo-1609859556272-9b2f48ef4e11',
  antalya: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989',
  uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  unitedkingdom: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad',
  edinburgh: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  nice: 'https://images.unsplash.com/photo-1533105079780-92b9be482077',
  italy: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
  venice: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0',
  florence: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd',
  milan: 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd',
  spain: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded',
  madrid: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
  germany: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b',
  berlin: 'https://images.unsplash.com/photo-1560969184-10fe8719e047',
  munich: 'https://images.unsplash.com/photo-1595867818082-083862f3d630',
  netherlands: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4',
  amsterdam: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4',
  switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99',
  zurich: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6',
  geneva: 'https://images.unsplash.com/photo-1573108037329-37b587a89868',
  lucerne: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95',
  austria: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af',
  vienna: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af',
  czechia: 'https://images.unsplash.com/photo-1541849546-216549ae216d',
  prague: 'https://images.unsplash.com/photo-1541849546-216549ae216d',
  hungary: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b',
  budapest: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b',
  greece: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
  athens: 'https://images.unsplash.com/photo-1555993539-1732b364db08',
  portugal: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b',
  lisbon: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b',

  // Americas & Oceania
  usa: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74',
  unitedstates: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74',
  newyork: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74',
  losangeles: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0',
  sanfrancisco: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
  lasvegas: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4',
  miami: 'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a',
  canada: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce',
  toronto: 'https://images.unsplash.com/photo-1517935706615-2717063c2225',
  vancouver: 'https://images.unsplash.com/photo-1559511260-66a65e09b245',
  australia: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
  melbourne: 'https://images.unsplash.com/photo-1514395462725-fb4566210144',
  newzealand: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  brazil: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
  riodejaneiro: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',

  // Africa
  morocco: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70',
  marrakech: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70',
  casablanca: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f',
  southafrica: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f',
  capetown: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f',
  kenya: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
  nairobi: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
};

const GLOBAL_TRAVEL_FALLBACKS = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
];

function seedIndex(s: string, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % max;
}

/** A stable, high-resolution landmark photo URL for a country or destination. */
export function countryImage(name?: string | null, width = 800, height = 500): string {
  const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean && COUNTRY_PHOTOS[clean]) {
    return `${COUNTRY_PHOTOS[clean]}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
  }
  for (const [key, url] of Object.entries(COUNTRY_PHOTOS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return `${url}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
    }
  }
  const fallback = GLOBAL_TRAVEL_FALLBACKS[seedIndex(clean || 'travel', GLOBAL_TRAVEL_FALLBACKS.length)];
  return `${fallback}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}
