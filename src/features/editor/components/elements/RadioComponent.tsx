import type { EditorComponentProps } from "@/features/editor";
import { ChoiceInputComponent } from "./shared/ChoiceInputComponent";

export default function RadioComponent(props: EditorComponentProps) {
  return <ChoiceInputComponent {...props} type="radio" />;
}
