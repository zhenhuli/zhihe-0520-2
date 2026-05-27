import { Suspense } from 'react';
import WorksPageContent from '@/components/WorksPageContent';

export default function WorksPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">加载中...</div>}>
      <WorksPageContent />
    </Suspense>
  );
}
