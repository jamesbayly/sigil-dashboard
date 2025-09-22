import OptionsTable from "./OptionsTable";

export default function OptionsView() {
  return (
    <div className="space-y-6">
      <OptionsTable
        title="Options Data"
        showUploadButton={true}
        showFilters={true}
      />
    </div>
  );
}
