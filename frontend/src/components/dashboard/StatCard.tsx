import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  icon: React.ElementType;
  isLoading: boolean;
  href?: string; // Optional link for the card
  colorClassName?: string; // Optional Tailwind color class for icon/value
}

export function StatCard({ title, value, icon: Icon, isLoading, href, colorClassName = 'text-primary' }: StatCardProps) {
  const content = (
    <Card className={cn(
        "hover:shadow-lg transition-shadow",
        href ? 'cursor-pointer' : ''
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", colorClassName)} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-1/2" />
        ) : (
          <div className={cn("text-3xl font-bold", colorClassName)}>{value ?? '-'}</div>
        )}
        {/* Optional: Add description or trend later */}
        {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}