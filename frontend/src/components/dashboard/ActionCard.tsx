import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon: React.ElementType;
  onClick?: () => void; // For actions like opening dialogs
  href?: string; // For navigation links
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | null | undefined;
  disabled?: boolean;
}

export function ActionCard({ title, description, buttonText, icon: Icon, onClick, href, variant = 'default', disabled = false }: ActionCardProps) {
  const buttonContent = (
    <Button onClick={onClick} variant={variant} disabled={disabled} className="w-full md:w-auto">
      <Icon className="mr-2 h-4 w-4" /> {buttonText}
    </Button>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
        <CardDescription className="pt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {href && !onClick ? (
          <Link href={href} passHref legacyBehavior>
            <a className={disabled ? 'pointer-events-none' : ''}>{buttonContent}</a>
          </Link>
        ) : (
          buttonContent
        )}
      </CardContent>
    </Card>
  );
}