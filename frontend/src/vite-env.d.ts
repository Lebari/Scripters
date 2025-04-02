/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_SIGNUP_URL: string
    readonly VITE_APP_LOGIN_URL: string
    readonly VITE_APP_LOGOUT_URL: string
    readonly VITE_APP_CATALOG_URL: string
    readonly VITE_APP_SEARCH_URL: string
    readonly VITE_APP_UPLOAD_URL: string
    readonly VITE_APP_DCH_UPDATE_URL: string
    readonly VITE_APP_FWD_UPDATE_URL: string
    readonly VITE_APP_UC31FWDBIDDING_URL: string
    readonly VITE_APP_UC32DCHBIDDING_URL: string
    readonly VITE_APP_UC4END_URL: string
    readonly VITE_APP_UC5PAY_URL: string
    readonly VITE_APP_UC6RECEIPT_URL: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}