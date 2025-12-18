import { EditorElement, ElementTemplate } from "@/types/global.type";
import {
  navbarComponent,
  navbarComponent2,
  navbarComponent3,
  navbarComponent4,
  navbarComponent5,
} from "./navbar/navbarComponents";
import { siteTemplates } from "./sitetemplates/siteTemplateComponents";
import {
  footerComponent,
  footerComponent2,
  footerComponent3,
  footerComponent4,
} from "./footer/footerComponents";
import {
  headerComponent,
  headerComponent2,
  headerComponent3,
} from "./header/headerComponents";
import {
  sidebarLeftComponent,
  sidebarLeftComponent2,
  sidebarLeftComponent3,
  sidebarLeftComponent4,
} from "./sidebar/sidebarLeftComponents";
import {
  sidebarRightComponent,
  sidebarRightComponent2,
  sidebarRightComponent3,
  sidebarRightComponent4,
} from "./sidebar/sidebarRightComponents";
import { formComponent1, formComponent2 } from "./form/formComponents";
import { landingPageSections } from "./landingpage/landingPageComponents";

export type CustomComponent = {
  component: ElementTemplate & {
    elements?: ElementTemplate[];
  };
};

const customComponents: CustomComponent[] = [
  navbarComponent,
  navbarComponent2,
  navbarComponent3,
  navbarComponent4,
  navbarComponent5,
  footerComponent,
  footerComponent2,
  footerComponent3,
  footerComponent4,
  headerComponent,
  headerComponent2,
  headerComponent3,
  sidebarLeftComponent,
  sidebarLeftComponent2,
  sidebarLeftComponent3,
  sidebarLeftComponent4,
  sidebarRightComponent,
  sidebarRightComponent2,
  sidebarRightComponent3,
  sidebarRightComponent4,
  formComponent1,
  formComponent2,
  ...landingPageSections,
  ...siteTemplates,
];

export const customComps = customComponents
  .flat()
  .map((customComp) => customComp.component);
