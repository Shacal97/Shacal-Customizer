(()=>{const bools = ['enabled','overrideNative','halo','haloRgb','haloRgbMulti','rgb','rgbMulti',
  'neonEnabled','neonSelected','pentagramSelected','disco','haloDisco','trail','trailRgb','trailRgbMulti'];
const colors = ['color','haloColor','trailColor'];
const numbers = {size:[.5,2],opacity:[.1,1],speed:[0,2],haloSize:[.5,2],haloOpacity:[.1,1],
  haloRgbSpeed:[.2,3],rgbSpeed:[.2,3],pentagramSpeed:[0,2],pentagramSize:[0,4],
  trailLife:[1,8],trailSize:[.5,2],trailOpacity:[.1,1]};
const enums = {neonStyle:['soft','pentagram'],pentagramStyle:['classic','double','arcane','ritual','static'],
  haloStyle:['soft','smoke','fire','chakra','petals'],trailShape:['foot','cat','bear','duck','dog']};
const allowed = new Set([...bools,...colors,...Object.keys(numbers),...Object.keys(enums)]);

function validateAppearance(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('INVALID_APPEARANCE');
  if (Object.keys(input).some(key => !allowed.has(key))) throw new Error('UNKNOWN_APPEARANCE_FIELD');
  const result = {};
  for (const key of bools) {
    if (typeof input[key] !== 'boolean') throw new Error(`INVALID_${key}`);
    result[key] = input[key];
  }
  for (const key of colors) {
    if (typeof input[key] !== 'string' || !/^#[0-9a-f]{6}$/i.test(input[key])) throw new Error(`INVALID_${key}`);
    result[key] = input[key].toLowerCase();
  }
  for (const [key, [min,max]] of Object.entries(numbers)) {
    if (typeof input[key] !== 'number' || !Number.isFinite(input[key]) || input[key] < min || input[key] > max) throw new Error(`INVALID_${key}`);
    result[key] = input[key];
  }
  for (const [key, values] of Object.entries(enums)) {
    if (!values.includes(input[key])) throw new Error(`INVALID_${key}`);
    result[key] = input[key];
  }
  if (result.neonSelected && result.pentagramSelected) throw new Error('CONFLICTING_NEON');
  if (result.neonEnabled !== (result.neonSelected || result.pentagramSelected)) throw new Error('CONFLICTING_NEON');
  if (result.neonStyle !== (result.pentagramSelected ? 'pentagram' : 'soft')) throw new Error('CONFLICTING_NEON');
  for (const [multi,rgb] of [['rgbMulti','rgb'],['haloRgbMulti','haloRgb'],['trailRgbMulti','trailRgb']]) {
    if (result[multi] && !result[rgb]) throw new Error('CONFLICTING_RGB');
  }
  return result;
}

window.ShacalSyncCore={validateAppearance};})();
