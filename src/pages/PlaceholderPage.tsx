import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <Construction className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">Módulo em desenvolvimento</p>
        </CardContent>
      </Card>
    </div>
  );
}
