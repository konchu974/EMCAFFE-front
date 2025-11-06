import ENLang from './en.json';
import FRLang from './fr.json';
import ESLang from './es.json';

export const languages = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
};

export const defaultLang = 'fr';

function flattenObject(ob: any) {
  const toReturn: any = {};
  for (const i in ob) {
    if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
    if (typeof ob[i] === 'object' && ob[i] !== null) {
      const flatObject = flattenObject(ob[i]);
      for (const x in flatObject) {
        if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

export const ui = {
  en: flattenObject(ENLang),
  fr: flattenObject(FRLang),
  es: flattenObject(ESLang),
} as const;

export function getLangFromUrl(url: URL) {
  const [, maybeLang] = url.pathname.split('/');
  return (maybeLang in ui ? maybeLang : defaultLang) as keyof typeof ui;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    const langSet = ui[lang] || ui[defaultLang];
    return langSet[key] || ui[defaultLang][key] || `[missing: ${String(key)}]`;
  };
}

export async function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}
