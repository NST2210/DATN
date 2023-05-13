export enum UTILS {
    WORD_TO_HTML = 'utils/convertWordToHtml',
}

export enum ROLES_ENDPOINT {
    SEARCH_DATA = 'roles/searchData',
    DELETE = 'roles/delete',
    LOCK_OR_UNLOCK = 'roles/do-lock-or-unlock',
    SAVE_OR_UPDATE = 'roles/save-or-update',
    GET_ACTIVE = 'roles/roleActive',
}

export enum USERS_ENDPOINT {
    USER_ROLE_INFO = 'users/getUserRoleInfo',
    GET_USER = 'users/getUsers',
    LOCK_UNLOCK_USER = 'users/doLockOrUnlock',
    SAVE_OR_UPDATE = 'users/saveOrUpdate',
    GET_LIST_ROLE = 'users/getListRole',
    DELETE_USER = 'users/deleteUser',
    RESET_PASS = 'users/resetPass',
    FOR_ROLE_TREE = 'users/userForRole',
    CURRENT_USER = 'users/getCurrentUser',
    CHANGE_PASS = 'users/changePass',
    ALL_USER_ROLE = 'users/all-user-role',
}

export enum MENU_GROUP_ENDPOINT {
    MENU_BY_LEVEL = 'menuGroup/getMenusByLevel',
    MENU_UPDATE_BY_LEVEL = 'menuGroup/updateMenuByLevel',
    MENU_UPDATE = 'menuGroup/updateMenu',
    SEARCH_DATA = 'menuGroup/search-data',
    MENU_PARENT = 'menuGroup/get-menu-parent',
    MAX_DISPLAY_ORDER = 'menuGroup/get-max-display-order?parentId=',
    SAVE_MENU_GROUP = 'menuGroup/save-menu-group',
    CHANGE_ACTIVE_STATUS = 'menuGroup/change-active-status',
    ALL_ROLE_ACTIVE = 'menuGroup/all-role-active?menuCode=',
    SAVE_MENU_GROUP_ROLE = 'menuGroup/save-menu-group-role',
    HAVE_SUB_MENU = 'menuGroup/have-sub-menu?id=',
}

export enum LANGUAGE_ENDPOINT {
    SEARCH_LANGUAGES = 'langs/searchData',
    SAVE_OR_UPDATE = 'langs',
    GET_DATA_DETAIL = 'langs/dataDetail',
    DELETE = 'langs/deleteLangById',
    GET_ALL = 'langs/getAll',
    GET_LANG_BY_PORTAL = 'langs/languageByPortal',
}

export enum COMPANY_ENDPOINT {
    GET_COMPANY = 'company/getCompany',
    SAVE_OR_UPDATE = 'company/saveOrUpdateCompany',
    DELETE = 'company/deleteCompany/',
}

export enum COMPANY_LANGUAGE_ENDPOINT {
    GET_COMPANY_LANGUAGE = 'companyLanguage/getCompanyLanguage',
    GET_DATA_LANG = 'companyLanguage/dataLang/',
    GET_COMPANY_LANGUAGE_DETAIL = 'companyLanguage/getByIdDetail/',
    SAVE_OR_UPDATE = 'companyLanguage/saveOrUpdate',
    DELETE = 'companyLanguage/deleteCompany/',
}

export enum PORTAL_INFO_ENDPOINT {
    SEARCH = 'portalInfo/searchData',
    DELETE = 'portalInfo',
    SAVE_OR_UPDATE = 'portalInfo',
    GET_DATA_DETAIL = 'portalInfo/dataDetail',
    GET_LANGUAGE_PORTAL = 'portalInfo/languageForPortal',
    GET_ALL_ACTIVE = 'portalInfo/allPortalActive',
    SAVE_PORTAL_UTIL_INFO = 'portalInfo/save-portal-util-info',
    SAVE_PORTAL_UTIL_LANGUAGE = 'portalInfo/save-portal-util-language',
    GET_LIST_LANGUAGE_IN_USE = 'portalInfo/get-list-language-in-use',
}

export enum PORTAL_MAIL_ENDPOINT {
    SEARCH = 'mailConfig/searchData',
    DELETE = 'mailConfig/delete',
    SAVE_OR_UPDATE = 'mailConfig/saveOrUpdateMail',
    GET_DATA_DETAIL = 'mailConfig/dataDetail',
    CHANGE_ACTIVITIES = 'mailConfig/changeActive',
}

export enum PORTAL_LANGUAGE_DETAIL {
    GET_FOOTER_INFO_FROM_PORTAL = 'portalLangDetail/footerInfoFromPortal',
}

export enum LINKED {
    GET_BY_PORTAL_AND_LANG_CODE = 'linked/getAllByPortalAndLangCode',
}

export enum ARTICLE_GROUP {
    GET_BY_PORTAL = 'articleGroup/articleGroupByPortal',
    SEARCH = 'articleGroup/searchData',
    SEARCH_FOR_PORTAL = 'articleGroup/search-data-for-portal',
    SEARCH_FOR_PORTAL_TO_CHECK = 'articleGroup/search-data-for-portal-to-check',
    LIST_MENU_BY_PORTAL = 'articleGroup/get-list-menu-by-portal',
    SAVE_PORTAL_ARTICLE_GROUP = 'articleGroup/save-portal-article-group',
    MAX_DISPLAY_ORDER = 'articleGroup/get-max-display-order',
    DELETE = 'articleGroup/delete-portal-article-group',
    CHANGE_STATUS = 'articleGroup/changeStatus',
    CHANGE_ACTIVE = 'articleGroup/changeActive',
    LIST_MENU_BY_PORTAL_AND_LANG = 'articleGroup/get-list-menu-by-portal-and-lang',
    LIST_ACTICLE_GROUP_SUB = 'articleGroup/articleGroupList',
    GET_CATEGORY_ARTICLE_BY_MENU_CODE = 'articleGroup/get-list-category-article-by-menu-code',
}

export enum ARTICLE_DETAIL {
    SAVE_UPDATE = 'articleDetail',
    SAVE_UPDATE_BY_USER_APPROVE = 'articleDetail/updateArticleByUserApprove',
    DETAIL = 'articleDetail/articleDataDetail',
    APPROVE_REJECT = 'articleDetail/approveOrReject',
    PUBLISH = 'articleGroup/publishArticle',
    FEEDBACK = 'articleDetail/getFeedbackArticle',
    GEN_CODE = 'articleDetail/genArticleCode',
    PUBLISHBYCHECKBOX = 'PUBLISHBYCHECKBOX',
    APPROVE_MULTI = 'articleDetail/approveMultiple',
    // SWITCH_USER = 'articleDetail/switchUserAprove',
    SWITCH_USER_MULTI_ART = 'articleDetail/switchMultiUser',
    GET_LIST_FLOW_STEP = 'articleDetail/getLstFlowStep',
    GET_ATTACH = 'articleDetail/attachByArticleDetailLangId',
    DUPLICATE = 'articleDetail/duplicate-article',
}

export enum ARTICLE_DETAIL_LANG {
    PUBLISH = 'articleDetailLang/publishArticle',
    PUBLISHBYCHECKBOX = 'articleDetailLang/publishArticleByCheckbox',
    CHANGE_ACTIVE = 'articleDetailLang/changeActive',
    DELETE = 'articleDetailLang/delete',
}

export enum PORTAL_USER_ENPOINT {
    ALL_USER_ACTIVE = 'portalUser/all-user-active?portalCode=',
    SAVE_PORTAL_USER = 'portalUser/save-portal-user',
}

export enum ARTICLE_GROUP_LANG_ENDPOINT {
    GET_BY_PORTAL_AND_LANG = 'articleGroupLang/get-list-article-group-lang',
}

export enum ARTICLE_DETAIL_HISTORY {
    GET_HISTORY_ARTICLE = 'articleDetailHistory',
}

export enum PORTAL_MENU_LANG_ENDPOINT {
    GET_LIST_PORTAL_MENU = 'portalMenuLang/get-list-portal-menu',
    SAVE_PORTAL_MENU = 'portalMenuLang/save-portal-menu',
    GET_LIST_PORTAL_MENU_LANG = 'portalMenuLang/get-list-portal-menu-lang',
    MAX_DISPLAY_ORDER = 'portalMenuLang/get-max-display-order?portalCode=',
    CHANGE_ACTIVITIES = 'portalMenuLang/changeActive',
    DELETE = 'portalMenuLang/delete',
}

export enum VIDEOS {
    SEARCH_VIDEOS = 'videos/searchData',
    SAVE_OR_UPDATE = 'videos/saveOrUpdate',
}

export enum IMG_VIDEOS {
    SEARCH_IMG_VIDEOS = 'attach/utils/searchData',
    SEARCH_IMG_VIDEO_BY_ARTICLE = 'attach/utils/searchDataImageVideo',
    DELETE = 'attach/utils/delete',
    PUBLISH = 'attach/utils/publishImageVideo',
    UPDATE_DESCRIPTION = 'attach/utils/saveDescription',
    SEARCH_IMG = 'attach/utils/searchDataImg',
    SEARCH_VIDEO = 'attach/utils/searchDataVideo',
    SEARCH_FOR_PUBLISH = 'attach/utils/searchDataForPublish',
    PUBLISH__IMG_VIDEOS = 'attach/utils/publishImgVideo',
    PUBLISH_IMG_VIDEOS_BYCHECKBOX = 'attach/utils/publishImgVideosByCheckbox',
    UPDATE_DESCRIPTION_ALOTSOF_IMGVIDEO = 'attach/utils/updateDescriptionALotsOfImgVideos',
}

export enum ATTACH_FILE {
    UPLOAD = 'attach/utils/uploadFile',
    UPLOADFILE_BANNER = 'attach/banner/uploadFile',
}
export enum BANNER {
    SEARCH_DATA = 'attach/banner/search',
    DELETE = 'attach/banner/delete',
    PUBLIC = 'attach/banner/publicBanner',
}

export enum PORTAL_FLOW {
    CREATE = 'portal/flow/createFlow',
    SEARCH = 'portal/flow/searchData',
    FLOW_PORTAL = 'portal/flow/flowByPortal',
    DELETE = 'portal/flow/delete',
    CHECK_FLOW = 'portal/flow/checkStatusApprove',
    FLOW_USER = 'portal/flow/flowUserByFlowCode',
    FLOW_STEP = 'portal/flow/flowStepByArticleDetailLangId',
}

export enum CATEGORY_ENDPOINT {
    GET_BY_REF_CODE = 'category/dataByRefCode',
}

export enum REPORT_ENDPOINT {
    GET_DATA_REPORT = 'report/reportListData',
    EXPORT_EXCEL = 'report/exportExcel',
    DATA_DASHBOARD_TOTAL = 'report/dataTotalDashboard',
    DATA_BAR_CHAR = 'report/dataBarChar',
    DATA_PIE_CHAR = 'report/dataPieChar',
}

export enum SYNC_DATA {
    SEARCH_DATA = 'syncHistory/searchData',
    SYNC = 'syncHistory/syncData',
    SEARCH_DATA_HISTORY = 'syncHistory/searchSyncHistory',
}

export enum FEEDBACK {
    GET_DATA_FEEDBACK = 'feedback/searchData',
    EXPORT_EXCEL = 'feedback/exportExcel',
}

export enum LINKED {
    SEARCH_LINKED = 'linked/searchData',
    DELETE = 'linked/deleteLinkedById',
    GET_DATA_DETAIL = 'linked/dataDetail',
    SAVE_OR_UPDATE = 'linked',
}

export enum PORTAL_INTRODUCE {
    SEARCH = 'portal-introduce/searchData',
    GET_DATA_DETAIL = 'portal-introduce/dataDetail',
    DELETE = 'portal-introduce/deleteById',
    SAVE_OR_UPDATE = 'portal-introduce',
}
