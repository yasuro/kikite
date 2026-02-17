import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const OrderForm = dynamic(
  () => import('./index').then(mod => ({ default: mod.OrderForm })),
  {
    loading: () => (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
    ssr: true
  }
);

export default OrderForm;