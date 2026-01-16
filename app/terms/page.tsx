import { promises as fs } from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function getPageContent() {
    const filePath = path.join(process.cwd(), 'data', 'pages.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.terms;
}

export const metadata = {
    title: 'Terms and Conditions | OfficialUM1',
    description: 'Terms and Conditions for OfficialUM1 services.',
};

export default async function TermsPage() {
    const content = await getPageContent();

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <article className="prose" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
            <Footer />
        </main>
    );
}
