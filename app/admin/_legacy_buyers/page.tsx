import { redirect } from 'next/navigation';

export default function BuyersPage() {
    redirect('/admin/inventory?tab=users');
}
