import * as crypto from 'crypto';
import { query as dbQuery } from './db';

const API_BASE = 'https://api.corporatetools.com';

function base64url(buf: Buffer): string {
    return buf.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

async function getKeys() {
    const rows: any = await dbQuery("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('corptools_access_key', 'corptools_secret_key', 'corptools_account_id')");
    const keys: any = {};
    rows.forEach((r: any) => keys[r.setting_key] = r.setting_value);
    return keys;
}

function createJWT(path: string, body: any, queryString: string, secret: string, accessKey: string): string {
    const header = { alg: 'HS256', typ: 'JWT', access_key: accessKey };
    const contentToHash = (queryString || '') + (body ? JSON.stringify(body) : '');
    const contentHash = crypto.createHash('sha256').update(contentToHash).digest('hex');

    const payload = {
        path: path,
        content: contentHash
    };

    const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
    const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', secret).update(signatureInput).digest();
    const encodedSignature = base64url(signature);

    return `${signatureInput}.${encodedSignature}`;
}

export async function ctRequest(method: string, path: string, body: any = null, queryParams: any = null, extraHeaders: any = null) {
    const keys = await getKeys();
    if (!keys.corptools_access_key || !keys.corptools_secret_key) {
        throw new Error("Corporate Tools API keys missing in settings.");
    }

    const url = new URL(path, API_BASE);
    if (queryParams) {
        Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
    }

    const queryString = url.search.startsWith('?') ? url.search.substring(1) : '';
    const jwt = createJWT(path, body, queryString, keys.corptools_secret_key, keys.corptools_access_key);

    const headers: any = {
        'Content-Type': 'application/json',
        'access_key': keys.corptools_access_key,
        'Authorization': `Bearer ${jwt}`
    };

    if (extraHeaders) {
        Object.assign(headers, extraHeaders);
    }

    const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    if (!response.ok) {
        const errorDetail = data.result?.request || data.message || JSON.stringify(data);
        throw new Error(`Corporate Tools API Error (${response.status}): ${errorDetail}`);
    }

    return data;
}

export async function createGhostCompany(name: string, state: string, entityType: string = 'Limited Liability Company') {
    return ctRequest('POST', '/companies', {
        duplicate_name_allowed: true,
        companies: [{
            name,
            entity_type: entityType,
            home_state: state
        }]
    });
}

export async function getOfferings(jurisdiction: string, company_id: string) {
    return ctRequest('GET', '/filing-products/offerings', null, {
        jurisdiction,
        company_id
    });
}

export async function getFilingMethods(companyId: string, filingProductId: string, jurisdiction?: string) {
    const params: any = { filing_product_id: filingProductId, company_id: companyId };
    if (jurisdiction) params.jurisdiction = jurisdiction;
    return ctRequest('GET', '/filing-methods', null, params, { 'company_id': companyId });
}

export async function getFilingSchema(companyId: string, productOptionId?: string, filingMethodId?: string) {
    const params: any = { company_id: companyId };
    if (productOptionId) params.product_option_id = productOptionId;
    if (filingMethodId) params.filing_method_id = filingMethodId;
    return ctRequest('GET', `/filing-methods/schemas/${companyId}`, null, params);
}

export async function getCompanies() {
    return ctRequest('GET', '/companies');
}

export async function getAccount() {
    return ctRequest('GET', '/account');
}
