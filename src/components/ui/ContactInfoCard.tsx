interface ContactInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}

export function ContactInfoCard({ icon, label, value, href }: ContactInfoCardProps) {
  const content = (
    <div className="flex items-start gap-4 p-5 bg-surface-container-lowest rounded-lg border border-outline-variant hover:shadow-tribal transition-all">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-label-sm text-primary uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-headline-sm text-on-surface">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block" target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
