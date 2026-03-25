import { B2bAdminFetchedList } from '@/components/b2b-admin';

export default function Page() {
  return (
    <B2bAdminFetchedList
      title="B2B reklamlar"
      endpoint="/b2b-admin/advertisements"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Reklamlar' },
      ]}
    />
  );
}
