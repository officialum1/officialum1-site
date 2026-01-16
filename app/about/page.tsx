import { promises as fs } from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

async function getPageContent() {
    const filePath = path.join(process.cwd(), 'data', 'pages.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data.about;
}

export const metadata = {
    title: 'About OfficialUM1 | Top Digital Agency in Sahiwal',
    description: 'We are a results-driven digital agency in Pakistan specializing in SEO, Web Development, and Brand Growth. Founded to help local businesses rank and rent.',
    keywords: ["Digital Marketing Agency Sahiwal", "About OfficialUM1", "SEO Experts Pakistan"],
};

export default async function AboutPage() {
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
