import axios from "axios";

let source = axios.CancelToken.source();

let apiUrl = process.env.REACT_APP_BACKEND
if (!apiUrl) {
    apiUrl = window.location.origin + "/api";
}

axios.defaults.headers = {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
};

axios.interceptors.response.use(null, error => {
    const expectedError =
        error.message === 'cancel' ||
        (error.response &&
            error.response.status >= 400 &&
            error.response.status < 500);
    if (!expectedError) {
        console.log('Unexpected HTTP error', error);
    }
    return Promise.reject(error);
})


export async function cleanQuery(query) {
    try {
        const response = await axios.get(`${apiUrl}/clean_query/${query}`);
        return response.data;
    } catch (exc) {
        return {error: exc.response.data};
    }
}

async function performRequest(url) {
    try {
        const response = await axios.get(url, {cancelToken: source.token});
        return {data: response.data, url: url};
    } catch (exc) {
        return {data: null, url: url};
    }

}

export async function getPrefixesForPrefix(prefix) {
    return await performRequest(`${apiUrl}/prefixes/prefix/${prefix}`);
}

export async function getPrefixesForASN(asn) {
    return await performRequest(`${apiUrl}/prefixes/asn/${asn}`);
}

export async function getSetMemberOf(target) {
    return await performRequest(`${apiUrl}/sets/member-of/${target}`);
}

export async function getSetExpansion(target) {
    return await performRequest(`${apiUrl}/sets/expand/${target}`);
}

export async function cancelAllRequests() {
    await source.cancel('cancel');
    source = axios.CancelToken.source();
}

const api = {
    getPrefixesForPrefix,
    getPrefixesForASN,
    cleanQuery,
    getSetMemberOf,
    getSetExpansion,
    cancelAllRequests,
}
export default api;
