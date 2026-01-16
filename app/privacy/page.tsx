import { promises as fs } from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function getPageContent() {
    const filePath = path.join(process.cwd(), 'data', 'pages.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.privacy;
}

export const metadata = {
    title: 'Privacy Policy | OfficialUM1',
    description: 'Privacy Policy for OfficialUM1. How we handle your data.',
};

export default async function PrivacyPage() {
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
