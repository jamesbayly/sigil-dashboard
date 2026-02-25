import { useState } from "react";
import { useOptionsData } from "@/hooks/useOptionsData";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles } from "lucide-react";
import OptionsList from "./OptionsList";
import OptionsUploadModal from "./OptionsUploadModal";
import { runAIDailyStockStrategy } from "@/utils/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function OptionsView() {
  const { isAuthenticated } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isRunningAI, setIsRunningAI] = useState(false);

  // We need createOptions from useOptionsData for the upload modal
  const { isCreating, createOptions } = useOptionsData();

  const handleRunAIStrategy = async () => {
    setIsRunningAI(true);
    try {
      const result = await runAIDailyStockStrategy();
      if ("message" in result) {
        toast.success(
          result.message || "AI daily stock strategy completed successfully!",
        );
      } else {
        toast.success("AI daily stock strategy completed!");
      }
    } catch (error) {
      toast.error("An error occurred while running the AI strategy");
      console.error("AI Strategy error:", error);
    } finally {
      setIsRunningAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <CardTitle>Options Data</CardTitle>
            {isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Upload className="h-4 w-4" />
                  Upload Options Data
                </Button>
                <Button
                  onClick={handleRunAIStrategy}
                  disabled={isRunningAI}
                  className="flex items-center gap-2 w-full sm:w-auto"
                  size="sm"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4" />
                  {isRunningAI ? "Running..." : "Run AI Strategy"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <OptionsList />

      <OptionsUploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        createOptions={createOptions}
        isCreating={isCreating}
      />
    </div>
  );
}
