import type { EditorComponentProps } from "@/features/editor";
import { ChoiceInputComponent } from "./shared/ChoiceInputComponent";

export default function CheckboxComponent(props: EditorComponentProps) {
  return <ChoiceInputComponent {...props} type="checkbox" />;
}
