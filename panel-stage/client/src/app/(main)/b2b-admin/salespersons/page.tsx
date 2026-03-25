import { B2bAdminFetchedList } from '@/components/b2b-admin';

export default function Page() {
  return (
    <B2bAdminFetchedList
      title="Plasiyerler"
      endpoint="/b2b-admin/salespersons"
      breadcrumbs={[
        { label: 'B2B Yönetimi', href: '/b2b-admin' },
        { label: 'Plasiyerler' },
      ]}
    />
  );
}
