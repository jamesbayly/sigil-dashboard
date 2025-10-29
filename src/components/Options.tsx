import OptionsTable from "./OptionsTable";

export default function OptionsView() {
  return (
    <div className="space-y-6">
      <OptionsTable
        title="Options Data"
        showActions={true}
        showFilters={true}
      />
    </div>
  );
}
