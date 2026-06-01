interface SpecRowProps {
  icon: string;
  text: string;
}

export default function SpecRow({ icon, text }: SpecRowProps) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 flex-shrink-0 mt-0.5">{icon}</span>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  );
}
