const crypto = require('crypto');

const ACCESS_KEY = '37872498dfab6c4efc644c6b048cfa4de2184a029cbba169e422daa9b8b741b663838abadcdd16b3';
const SECRET_KEY = 'e449819475ada558e5e69b59ec935c7be2030af85a3b1e6445ceda6797b877d037964d0b5d7e2dba';
const API_BASE = 'https://api.corporatetools.com';

function base64url(buf) {
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createJWT(path, body, queryString, secret, accessKey) {
    const header = { alg: 'HS256', typ: 'JWT', access_key: accessKey };
    const contentToHash = (queryString || '') + (body ? JSON.stringify(body) : '');
    const contentHash = crypto.createHash('sha256').update(contentToHash).digest('hex');
    const payload = { path: path, content: contentHash };
    const encodedHeader = base64url(Buffer.from(JSON.stringify(header)));
    const encodedPayload = base64url(Buffer.from(JSON.stringify(payload)));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', secret).update(signatureInput).digest();
    return `${signatureInput}.${base64url(signature)}`;
}

async function getAccount() {
    const path = '/account';
    const jwt = createJWT(path, null, '', SECRET_KEY, ACCESS_KEY);

    const res = await fetch(API_BASE + path, {
        headers: {
            'Authorization': 'Bearer ' + jwt,
            'access_key': ACCESS_KEY
        }
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

getAccount();
