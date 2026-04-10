import { NextResponse } from 'next/server';
import { createGhostCompany, getFilingSchema, getOfferings, getAccount, getFilingMethods, getCompanies } from '@/lib/corptools';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'schema';
    const companyId = searchParams.get('company_id');
    const state = searchParams.get('state') || searchParams.get('jurisdiction');
    const productOptionId = searchParams.get('product_option_id');
    const filingProductId = searchParams.get('filing_product_id');
    const filingMethodId = searchParams.get('filing_method_id');

    try {
        if (type === 'account') {
            const account = await getAccount();
            return NextResponse.json(account);
        }

        if (type === 'companies') {
            const companies = await getCompanies();
            return NextResponse.json(companies);
        }

        if (type === 'methods') {
            if (!companyId || !filingProductId) return NextResponse.json({ error: "Missing company_id or filing_product_id" }, { status: 400 });
            const methods = await getFilingMethods(companyId, filingProductId, state || undefined);
            return NextResponse.json(methods);
        }

        if (type === 'offerings') {
            if (!state || !companyId) return NextResponse.json({ error: "Missing state or company_id" }, { status: 400 });
            const offerings = await getOfferings(state, companyId);
            return NextResponse.json(offerings);
        }

        // Default to schema
        if (!companyId) return NextResponse.json({ error: "Missing company_id" }, { status: 400 });
        const schema = await getFilingSchema(companyId, productOptionId || undefined, filingMethodId || undefined);
        return NextResponse.json(schema);
    } catch (e: any) {
        console.error("CorpTools API Proxy Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { name, state, entityType } = await request.json();

        if (!name || !state) {
            return NextResponse.json({ error: "Missing name or state" }, { status: 400 });
        }

        const company = await createGhostCompany(name, state, entityType);
        return NextResponse.json(company);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
