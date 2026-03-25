import { B2bAdminFetchedList } from '@/components/b2b-admin';

export default function Page() {
  return (
    <B2bAdminFetchedList
      title="Müşteri sınıfları"
      endpoint="/b2b-admin/customer-classes"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Müşteri sınıfları' },
      ]}
    />
  );
}
