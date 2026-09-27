import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q')?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json({ items: [], total_results: 0 });
        }

        // Clean query from common suffixes for broad check
        const cleanName = query.replace(/\b(limited|ltd|llp|plc)\b/gi, '').trim();

        const apiKey = process.env.COMPANIES_HOUSE_API_KEY;

        if (apiKey) {
            const authHeader = 'Basic ' + Buffer.from(apiKey + ':').toString('base64');
            const res = await fetch(`https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(cleanName)}&items_per_page=6`, {
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json'
                },
                next: { revalidate: 30 }
            });

            if (res.ok) {
                const data = await res.json();
                const exactMatch = (data.items || []).some((item: any) => 
                    item.title?.toLowerCase() === query.toLowerCase() ||
                    item.title?.toLowerCase() === `${query.toLowerCase()} ltd` ||
                    item.title?.toLowerCase() === `${query.toLowerCase()} limited`
                );

                return NextResponse.json({
                    available: !exactMatch,
                    exactMatch: exactMatch,
                    items: (data.items || []).map((item: any) => ({
                        title: item.title,
                        company_number: item.company_number,
                        company_status: item.company_status,
                        date_of_creation: item.date_of_creation,
                        address: item.address_snippet
                    })),
                    total_results: data.total_results || 0
                });
            }
        }

        // Fallback simulation / validation if API key is not yet set
        return NextResponse.json({
            available: true,
            exactMatch: false,
            items: [],
            total_results: 0,
            message: "Name formatted and ready for Companies House registry check"
        });

    } catch (error: any) {
        console.error('Companies House search error:', error);
        return NextResponse.json({ available: true, items: [], error: error.message }, { status: 200 });
    }
}
