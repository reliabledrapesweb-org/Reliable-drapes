import "./template.css";

export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="template-fade-in">{children}</div>;
}
