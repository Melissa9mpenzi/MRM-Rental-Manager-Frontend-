export default function GovModuleHeader({ title, subtitle }) {
  return (
    <div className="gov-module-header">
      <h2 className="gov-module-header__title">{title}</h2>
      {subtitle && <p className="gov-module-header__sub">{subtitle}</p>}
    </div>
  );
}
