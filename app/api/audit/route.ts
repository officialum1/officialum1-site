import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { website, email } = await req.json();

        if (!website) {
            return NextResponse.json({ error: "Website URL is required" }, { status: 400 });
        }

        // 1. Simulate AI Analysis (Real Fetching)
        const startTime = Date.now();
        let html = '';
        let status = 0;
        let score = 70; // Base score
        let responseHeaders: Headers | null = null;
        const issues: string[] = [];
        const passed: string[] = [];

        try {
            const res = await fetch(website, {
                headers: { 'User-Agent': 'OfficialUM1-AI-Audit/1.0' },
                signal: AbortSignal.timeout(5000) // 5s timeout
            });
            status = res.status;
            html = await res.text();
            responseHeaders = res.headers;
        } catch (e) {
            return NextResponse.json({
                success: false,
                error: "Could not access website. Please ensure the URL is correct and public."
            });
        }

        const endTime = Date.now();
        const loadTime = endTime - startTime;

        // 2. Perform Checks

        // Check 1: Speed
        if (loadTime < 500) {
            passed.push("Lightning Fast Load Speed (< 500ms)");
            score += 10;
        } else if (loadTime < 1500) {
            passed.push("Good Load Speed");
            score += 5;
        } else {
            issues.push(`Slow Load Time (${loadTime}ms). Recommended: < 1000ms`);
            score -= 10;
        }

        // Check 2: Title Tag
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
            const title = titleMatch[1];
            if (title.length > 60) {
                issues.push(`Title tag is too long (${title.length} chars). Recommended: < 60 chars.`);
                score -= 5;
            } else {
                passed.push("Title Tag is optimized");
                score += 5;
            }
        } else {
            issues.push("Missing Title Tag (Critical for SEO)");
            score -= 20;
        }

        // Check 3: Meta Description
        const metaDesc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?>/i);
        if (metaDesc && metaDesc[1]) {
            passed.push("Meta Description present");
            score += 5;
        } else {
            issues.push("Missing Meta Description");
            score -= 10;
        }

        // Check 4: H1 Tag
        const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1) {
            passed.push("H1 Tag present");
            score += 5;
        } else {
            issues.push("Missing H1 Tag");
            score -= 10;
        }

        // Check 5: Content Assessment
        // Strip tags to get raw text roughly
        const bodyContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        const wordCount = bodyContent.split(' ').length;
        if (wordCount < 300) {
            issues.push(`Thin Content (${wordCount} words). Recommended: > 300 words`);
            score -= 10;
        } else {
            passed.push(`Good Content Length (~${wordCount} words)`);
            score += 5;
        }

        // Check 6: Mobile Responsiveness (Viewport)
        const viewport = html.match(/<meta\s+name=["']viewport["'][^>]*>/i);
        if (viewport) {
            passed.push("Mobile Viewport configuration found");
            score += 5;
        } else {
            issues.push("Missing Viewport Tag (Mobile unfriendly)");
            score -= 15;
        }

        // Check 7: Image Alt Attributes
        const imgTags = (html.match(/<img[^>]+>/g) || []);
        let missingAlt = 0;
        imgTags.forEach(tag => {
            if (!tag.match(/alt=["'][^"']*["']/i)) missingAlt++;
        });

        if (imgTags.length > 0) {
            if (missingAlt > 0) {
                issues.push(`${missingAlt} Images missing Alt Text`);
                score -= 5;
            } else {
                passed.push(`All ${imgTags.length} images have Alt Text`);
                score += 5;
            }
        } else {
            issues.push("No images found (Visuals improve engagement)");
            score -= 5;
        }

        // Check 8: Open Graph (Social Sharing)
        const ogTitle = html.match(/property=["']og:title["']/i);
        const ogImage = html.match(/property=["']og:image["']/i);
        if (ogTitle && ogImage) {
            passed.push("Social Media Tags (Open Graph) present");
            score += 5;
        } else {
            issues.push("Missing Social Media Tags (OG Data)");
            // Minor priority, no huge deduction
        }

        // Check 9: Structure (H2/H3)
        const h2 = html.match(/<h2/i);
        const h3 = html.match(/<h3/i);
        if (h2 || h3) {
            passed.push("Good Heading Structure (H2/H3 found)");
            score += 5;
        } else {
            issues.push("Poor Structure (No sub-headings detected)");
            score -= 5;
        }

        // Check 10: Link Analysis
        const links = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/g) || [];
        let internalLinks = 0;
        let externalLinks = 0;

        links.forEach(link => {
            if (link.includes(website) || link.includes('href="/"') || link.includes('href="/')) {
                internalLinks++;
            } else if (link.includes('http')) {
                externalLinks++;
            }
        });

        // Check 11: Canonical Tag
        const canonical = html.match(/<link\s+rel=["']canonical["'][^>]*>/i);
        if (canonical) {
            passed.push("Canonical Tag is present");
            score += 5;
        } else {
            issues.push("Missing Canonical Tag (Potential duplicate content issues)");
        }

        // Check 12: Robots Meta
        const robots = html.match(/<meta\s+name=["']robots["'][^>]*>/i);
        if (robots) {
            passed.push("Robots Meta Tag found");
        } else {
            // Not necessarily bad, but good to know
        }

        // Check 13: Favicon
        const favicon = html.match(/<link\s+rel=["'](?:shortcut )?icon["'][^>]*>/i);
        if (favicon) {
            passed.push("Favicon is present");
        } else {
            issues.push("Missing Favicon");
            score -= 2;
        }

        // Check 14: Language Attribute
        const lang = html.match(/<html[^>]+lang=["'][^"']+["'][^>]*>/i);
        if (lang) {
            passed.push("HTML Language attribute set");
        } else {
            issues.push("Missing 'lang' attribute in HTML tag");
            score -= 3;
        }

        // Check 15: Character Set
        const charset = html.match(/<meta\s+charset=["'][^"']+["'][^>]*>/i);
        if (charset) {
            passed.push("Character Encoding declared");
        } else {
            issues.push("Missing Character Encoding declaration");
            score -= 3;
        }

        // Resource Counts
        const scripts = (html.match(/<script[^>]*>/g) || []).length;
        const styles = (html.match(/<link\s+rel=["']stylesheet["'][^>]*>/g) || []).length;

        // Check 16: Schema Markup (Structured Data)
        const schema = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>/i);
        if (schema) {
            passed.push("Schema Markup (Structured Data) detected");
            score += 5;
        } else {
            issues.push("Missing Schema Markup (JSON-LD)");
        }

        // Check 17: Security Headers
        const secureHeaders = [];
        if (responseHeaders) {
            if (responseHeaders.get('strict-transport-security')) secureHeaders.push('HSTS');
            if (responseHeaders.get('x-frame-options')) secureHeaders.push('X-Frame-Options');
            if (responseHeaders.get('x-content-type-options')) secureHeaders.push('X-Content-Type-Options');
        }

        if (secureHeaders.length > 0) {
            passed.push(`Security Headers found: ${secureHeaders.join(', ')}`);
            score += 5;
        } else {
            issues.push("Missing basic Security Headers");
        }

        // Check 18: Social Media Links
        const socialPlatforms = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'tiktok.com'];
        const foundSocials: string[] = [];
        links.forEach(link => {
            socialPlatforms.forEach(platform => {
                if (link.includes(platform) && !foundSocials.includes(platform)) {
                    foundSocials.push(platform);
                }
            });
        });
        if (foundSocials.length > 0) {
            passed.push(`Social Profiles linked: ${foundSocials.map(s => s.split('.')[0]).join(', ')}`);
            score += 5;
        } else {
            issues.push("No Social Media links found on homepage");
        }

        // Check 19: Keyword Density (Top 5 Words)
        const stopWords = ['the', 'and', 'to', 'of', 'a', 'in', 'is', 'that', 'for', 'it', 'as', 'was', 'with', 'on', 'are', 'your', 'be', 'this', 'or', 'at', 'have', 'from', 'by', 'we', 'us', 'our', 'can', 'you', 'will', 'not'];
        const words = bodyContent.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
        const wordFreq: Record<string, number> = {};
        words.forEach(w => {
            if (!stopWords.includes(w)) {
                wordFreq[w] = (wordFreq[w] || 0) + 1;
            }
        });
        const topKeywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));

        // Check 20: Modern Image Formats
        const modernImages = (html.match(/\.(webp|avif)/gi) || []).length;
        if (modernImages > 0) {
            passed.push(`Modern Image Formats detected (${modernImages} instances)`);
            score += 5;
        } else if (imgTags.length > 0) {
            issues.push("No WebP/AVIF images detected (Use modern formats for speed)");
            score -= 5;
        }

        // Check 21: Email Privacy
        const emails = html.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        if (emails && emails.length > 0) {
            issues.push("Email addresses found in plain text (Spam Risk)");
            // Minor deduction
        } else {
            passed.push("Email Privacy protected");
        }

        // Check 22: Deprecated HTML
        const deprecated = html.match(/<(center|font|strike|u|dir|applet|acronym)[^>]*>/gi);
        if (deprecated) {
            issues.push(`Deprecated HTML tags found: ${deprecated.length} instances`);
            score -= 5;
        } else {
            passed.push("No deprecated HTML tags found");
            score += 5;
        }

        // Check 23: Doctype
        if (html.trim().toLowerCase().startsWith('<!doctype html>')) {
            passed.push("HTML5 Doctype declared");
        } else {
            issues.push("Missing or invalid Doctype declaration");
        }

        // Check 24: Tech Stack Detection
        const techStack = [];
        if (html.includes('wp-content')) techStack.push('WordPress');
        if (html.includes('shopify')) techStack.push('Shopify');
        if (html.includes('wix')) techStack.push('Wix');
        if (html.includes('squarespace')) techStack.push('Squarespace');
        if (html.includes('_next/static')) techStack.push('Next.js');
        if (html.includes('data-reactroot')) techStack.push('React');
        if (html.includes('googletagmanager')) techStack.push('Google Tag Manager');
        if (html.includes('google-analytics')) techStack.push('Google Analytics');
        if (html.includes('fbevents.js')) techStack.push('Facebook Pixel');
        if (html.includes('jquery')) techStack.push('jQuery');
        if (html.includes('bootstrap')) techStack.push('Bootstrap');
        if (html.includes('tailwind')) techStack.push('Tailwind CSS');

        // Normalize Score
        score = Math.max(0, Math.min(100, score));

        // 3. Save Lead (Still save it as a contact request)
        const dataFilePath = path.join(process.cwd(), 'data', 'messages.json');
        let messages = [];
        try {
            const fileContents = await fs.readFile(dataFilePath, 'utf8');
            messages = JSON.parse(fileContents);
        } catch { }

        messages.unshift({
            id: Date.now(),
            date: new Date().toLocaleString(),
            name: "Audit User",
            email,
            service: "SEO Audit",
            message: `Audit for ${website}. Score: ${score}`,
            status: 'new',
            reportDetails: {
                url: website,
                score,
                techStack,
                topKeywords,
                loadTime,
                wordCount,
                passed,
                issues
            }
        });

        const dir = path.dirname(dataFilePath);
        try { await fs.access(dir); } catch { await fs.mkdir(dir, { recursive: true }); }
        await fs.writeFile(dataFilePath, JSON.stringify(messages, null, 2));


        // 4. Return Report
        return NextResponse.json({
            success: true,
            report: {
                url: website,
                score,
                loadTime,
                wordCount,
                imgCount: imgTags.length,
                internalLinks,
                externalLinks,
                scripts,
                styles,
                topKeywords,
                techStack,
                passed,
                issues
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Audit failed" }, { status: 500 });
    }
}
