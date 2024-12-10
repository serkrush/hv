import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import enUS from '../../static/locales/enUS/common';
import enUSErrors from '../../static/locales/enUS/errors';
import enUSMessages from '../../static/locales/enUS/messages';

import uk from '../../static/locales/uk/common';
import ukErrors from '../../static/locales/uk/errors';
import ukMessages from '../../static/locales/enUS/messages';

const resources = {
    enUS: {
        translation: {
            ...enUS.translation,
            ...enUSErrors.translation,
            ...enUSMessages.translation,
        },
    },
    uk: {
        translation: {
            ...uk.translation,
            ...ukErrors.translation,
            ...ukMessages.translation,
        },
    },
};

i18next.use(initReactI18next).init({
    lng: 'enUS',
    compatibilityJSON: 'v3',
    fallbackLng: 'enUS',
    debug: true,
    resources,
    interpolation: {
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});
