import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import useElementStore from "@/globalstore/elementstore";
import { elementHelper } from "@/utils/element/elementhelper";
import { useState, useEffect } from "react";

export const AppearanceAccordion = () => {
  const { selectedElement } = useElementStore();

  // State for style properties
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState([1]);
  const [borderRadius, setBorderRadius] = useState([0]);
  const [opacity, setOpacity] = useState([100]);
  const [fontSize, setFontSize] = useState("16");
  const [fontWeight, setFontWeight] = useState("400");
  const [padding, setPadding] = useState("8");
  const [margin, setMargin] = useState("0");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [display, setDisplay] = useState("block");
  const [position, setPosition] = useState("static");
  const [zIndex, setZIndex] = useState("0");

  // Load existing styles when element is selected
  useEffect(() => {
    if (selectedElement?.styles) {
      const styles = selectedElement.styles;
      setBackgroundColor(styles.backgroundColor || "#ffffff");
      setTextColor(styles.color || "#000000");
      setBorderColor(styles.borderColor || "#000000");
      setBorderWidth([parseInt(styles.borderWidth as string) || 1]);
      setBorderRadius([parseInt(styles.borderRadius as string) || 0]);
      setOpacity([
        Math.round((parseFloat(styles.opacity as string) || 1) * 100),
      ]);
      setFontSize((styles.fontSize as string) || "16");
      setFontWeight((styles.fontWeight as string) || "400");
      setPadding((styles.padding as string) || "8");
      setMargin((styles.margin as string) || "0");
      setWidth((styles.width as string) || "");
      setHeight((styles.height as string) || "");
      setDisplay((styles.display as string) || "block");
      setPosition((styles.position as string) || "static");
      setZIndex((styles.zIndex as string) || "0");
    }
  }, [selectedElement]);

  const updateStyle = (property: string, value: any) => {
    if (!selectedElement) return;

    elementHelper.updateElementStyle(selectedElement, property, value);
  };

  const handleColorChange = (
    property: string,
    value: string,
    setter: React.Dispatch<string>
  ) => {
    setter(value);
    updateStyle(property, value);
  };

  const handleSliderChange = (
    property: string,
    values: number[],
    setter: React.Dispatch<number[]>,
    unit: string = "px"
  ) => {
    setter(values);
    const value =
      property === "opacity" ? values[0] / 100 : `${values[0]}${unit}`;
    updateStyle(property, value);
  };

  const handleInputChange = (
    property: string,
    value: string,
    setter: React.Dispatch<string>
  ) => {
    setter(value);
    updateStyle(property, value);
  };

  if (!selectedElement) {
    return <AccordionItem value="appearance"></AccordionItem>;
  }

  return (
    <AccordionItem value="appearance">
      <AccordionTrigger className="text-sm">Appearance</AccordionTrigger>
      <AccordionContent>
        {/* Colors */}
        <Accordion
          type="multiple"
          defaultValue={["colors", "border", ""]}
        ></Accordion>
      </AccordionContent>
    </AccordionItem>
  );
};
