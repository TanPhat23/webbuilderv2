import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";
import { DataLoaderElement, DataLoaderSettings } from "@/interfaces/elements.interface";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function DataLoaderConfiguration() {
  const { selectedElement } = useSelectionStore();
  const { updateElement } = useElementStore();

  if (!selectedElement || selectedElement.type !== "DataLoader") return null;

  const dataLoader = selectedElement as DataLoaderElement;

  const updateSettings = (newSettings: Partial<DataLoaderSettings>) => {
    updateElement(selectedElement.id, {
      settings: { ...dataLoader.settings, ...newSettings }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="api-url">API URL</Label>
        <Input
          id="api-url"
          value={dataLoader.settings?.apiUrl || ""}
          onChange={(e) => updateSettings({ apiUrl: e.target.value })}
          placeholder="https://api.example.com/data"
        />
      </div>

      <div>
        <Label htmlFor="http-method">HTTP Method</Label>
        <Select
          value={dataLoader.settings?.method || "GET"}
          onValueChange={(value: "GET" | "POST" | "PUT" | "DELETE") =>
            updateSettings({ method: value })
          }
        >
          <SelectTrigger id="http-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="auth-token">Authorization Token</Label>
        <Input
          id="auth-token"
          type="password"
          value={dataLoader.settings?.authToken || ""}
          onChange={(e) => updateSettings({ authToken: e.target.value })}
          placeholder="Bearer token or API key"
        />
      </div>

      <div>
        <Label htmlFor="request-body">Request Body (JSON)</Label>
        <Textarea
          id="request-body"
          value={dataLoader.settings?.body || ""}
          onChange={(e) => updateSettings({ body: e.target.value })}
          placeholder='{"key": "value"}'
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="headers">Headers (JSON)</Label>
        <Textarea
          id="headers"
          value={dataLoader.settings?.headers ? JSON.stringify(dataLoader.settings.headers, null, 2) : ""}
          onChange={(e) => {
            try {
              const headers = e.target.value ? JSON.parse(e.target.value) : {};
              updateSettings({ headers });
            } catch (error) {
            }
          }}
          placeholder='{"Content-Type": "application/json"}'
          rows={3}
        />
      </div>
    </div>
  );
}
