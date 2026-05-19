export const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>}
    </div>
    {action}
  </div>
);
