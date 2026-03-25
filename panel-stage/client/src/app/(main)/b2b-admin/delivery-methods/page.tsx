import { B2bAdminFetchedList } from '@/components/b2b-admin';

export default function Page() {
  return (
    <B2bAdminFetchedList
      title="Teslimat yöntemleri"
      endpoint="/b2b-admin/delivery-methods"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Teslimat' },
      ]}
    />
  );
}
