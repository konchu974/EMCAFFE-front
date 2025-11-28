import ENLang from './en.json';
import FRLang from './fr.json';
import ESLang from './es.json';

export const languages = {
    en: 'English',
    fr: 'Français',
    es: 'Español',
};

export const defaultLang = 'fr';

export const ui = {
    en: flattenObject(ENLang),
    fr: flattenObject(FRLang),
    es: flattenObject(ESLang),
} as const;

function flattenObject(ob: any) {
    const toReturn: any = {};

    for (const i in ob) {
        if (!ob.hasOwnProperty(i)) continue;

        if (typeof ob[i] === 'object' && ob[i] !== null) {
            const flatObject = flattenObject(ob[i]);
            for (const x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;

                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = ob[i];
        }
    }
    return toReturn;
}

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in ui) return lang as keyof typeof ui;
    return defaultLang as keyof typeof ui; // ✅ Fix : retourner defaultLang
}

// Créer un type qui exclut les symbols
type TranslationKey = Exclude<keyof (typeof ui)[typeof defaultLang], symbol>;

export function useTranslations(lang: keyof typeof ui) {
    return function t(key: TranslationKey) {
        // Vérifier si la langue existe
        if (!ui[lang]) {
            console.warn(`⚠️ Langue "${lang}" non trouvée, utilisation de "${defaultLang}"`);
            lang = defaultLang;
        }

        // Récupérer la traduction
        const translation = ui[lang][key];

        // Si pas de traduction dans la langue demandée, essayer la langue par défaut
        if (translation === undefined) {
            const fallback = ui[defaultLang][key];

            if (fallback === undefined) {
                console.warn(`⚠️ Traduction manquante : "${key}" (langue: ${lang})`);
                return key; // ✅ key est garantie d'être une string
            }

            return fallback;
        }

        return translation;
    };
}


export async function getStaticPaths() {
    return Object.keys(languages).map((lang) => ({ params: { lang } }));
}
