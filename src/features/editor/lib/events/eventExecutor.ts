/**
 * Event Executor - Handles execution of event handlers
 * Manages conditions, actions, and chaining
 */

import {
  EventHandler,
  EventExecutionContext,
  EventActionConfig,
  EventCondition,
} from "@/features/editor";

class EventExecutor {
  /**
   * Execute a single event handler
   */
  async execute(
    handler: EventHandler,
    context: EventExecutionContext,
  ): Promise<any> {
    try {
      // Check if handler is enabled
      if (handler.enabled === false) {
        return;
      }

      // Apply event modifiers
      if (handler.preventDefault && context.event) {
        (context.event as any).preventDefault?.();
      }

      if (handler.stopPropagation && context.event) {
        (context.event as any).stopPropagation?.();
      }

      // Check conditions
      if (handler.conditions && handler.conditions.length > 0) {
        const conditionsMet = await this.checkConditions(
          handler.conditions,
          context,
        );
        if (!conditionsMet) {
          return;
        }
      }

      // Apply delay if specified
      if (handler.delay && handler.delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, handler.delay));
      }

      // Execute the action
      const result = await this.executeAction(handler.config, context);

      // Handle conditional branching (for condition nodes)
      if (handler.trueHandlers || handler.falseHandlers) {
        // Evaluate the result as a boolean condition
        const conditionMet = this.evaluateConditionResult(result);

        if (conditionMet && handler.trueHandlers) {
          // Execute true branch
          for (const trueHandler of handler.trueHandlers) {
            await this.execute(trueHandler, context);
          }
        } else if (!conditionMet && handler.falseHandlers) {
          // Execute false branch
          for (const falseHandler of handler.falseHandlers) {
            await this.execute(falseHandler, context);
          }
        }
      } else if (handler.nextHandlers && handler.nextHandlers.length > 0) {
        // Execute next handlers in sequence (standard chaining)
        for (const nextHandler of handler.nextHandlers) {
          await this.execute(nextHandler, context);
        }
      }

      return result;
    } catch (error) {
      console.error("Error executing event handler:", error);
      throw error;
    }
  }

  /**
   * Evaluate condition result as boolean
   */
  private evaluateConditionResult(result: any): boolean {
    // Handle various truthy/falsy values
    if (typeof result === "boolean") {
      return result;
    }
    if (typeof result === "number") {
      return result !== 0;
    }
    if (typeof result === "string") {
      return result.toLowerCase() === "true" || result === "1";
    }
    // Default to truthy check
    return !!result;
  }

  /**
   * Check if all conditions are met
   */
  async checkConditions(
    conditions: EventCondition[],
    context: EventExecutionContext,
  ): Promise<boolean> {
    for (const condition of conditions) {
      const conditionMet = await this.checkCondition(condition, context);
      if (!conditionMet) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check a single condition
   */
  async checkCondition(
    condition: EventCondition,
    context: EventExecutionContext,
  ): Promise<boolean> {
    switch (condition.type) {
      case "always":
        return true;

      case "stateEquals":
        const stateValue = this.getNestedValue(
          context.elementState,
          condition.left || "",
        );
        return stateValue === condition.right;

      case "stateCheck":
        return this.compareValues(
          this.getNestedValue(context.elementState, condition.left || ""),
          condition.operator || "==",
          condition.right,
        );

      case "customCode":
        try {
          // Create a function in safe context
          const fn = new Function(
            "state",
            "element",
            condition.customCode || "true",
          );
          return fn(context.elementState, context.element);
        } catch (error) {
          console.error("Error evaluating condition code:", error);
          return false;
        }

      default:
        return true;
    }
  }

  /**
   * Execute action based on config
   */
  async executeAction(
    config: EventActionConfig,
    context: EventExecutionContext,
  ): Promise<any> {
    switch (config.type) {
      case "navigate":
        return this.handleNavigate(config, context);

      case "showElement":
      case "hideElement":
      case "toggleElement":
        return this.handleToggleElement(config, context);

      case "apiCall":
        return this.handleApiCall(config, context);

      case "setData":
        return this.handleSetData(config, context);

      case "customCode":
        return this.handleCustomCode(config, context);

      case "scrollTo":
        return this.handleScroll(config, context);

      case "modal":
        return this.handleModal(config, context);

      case "showNotification":
        return this.handleNotification(config, context);

      case "copyToClipboard":
        return this.handleCopyToClipboard(config, context);

      case "downloadFile":
        return this.handleDownloadFile(config, context);

      case "playAnimation":
        return this.handleAnimation(config, context);

      case "submitForm":
      case "resetForm":
        return this.handleFormAction(config, context);

      case "addClass":
      case "removeClass":
      case "toggleClass":
        return this.handleToggleClass(config, context);

      default:
        console.warn("Unknown action type:", (config as any).type);
    }
  }

  /**
   * Handle navigate action
   */
  private handleNavigate(config: any, context: EventExecutionContext): void {
    const url = config.value;

    if (config.openInNewTab) {
      window.open(url, "_blank");
    } else {
      if (config.replaceHistory) {
        window.history.replaceState(null, "", url);
      } else {
        window.location.href = url;
      }
    }
  }

  /**
   * Handle show/hide/toggle element
   */
  private handleToggleElement(
    config: any,
    context: EventExecutionContext,
  ): void {
    const element = document.getElementById(config.elementId);
    if (!element) return;

    const isHidden = element.style.display === "none";

    if (config.type === "showElement") {
      element.style.display = "";
    } else if (config.type === "hideElement") {
      element.style.display = "none";
    } else if (config.type === "toggleElement") {
      element.style.display = isHidden ? "" : "none";
    }
  }

  /**
   * Handle API call action
   */
  private async handleApiCall(
    config: any,
    context: EventExecutionContext,
  ): Promise<any> {
    try {
      const options: RequestInit = {
        method: config.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
      };

      if (config.body) {
        options.body = JSON.stringify(config.body);
      }

      const response = await fetch(config.url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Store response if needed
      if (config.storeResponseAs) {
        context.elementState[config.storeResponseAs] = data;
      }

      return data;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  }

  /**
   * Handle set data action
   */
  private handleSetData(config: any, context: EventExecutionContext): void {
    let value = config.value;

    // Get value from different sources
    if (config.valueType === "event" && context.event) {
      const target = (context.event as any).target as any;
      if (config.fromEvent === "target.value") {
        value = target.value;
      } else if (config.fromEvent === "target.checked") {
        value = target.checked;
      } else if (config.fromEvent === "target.files") {
        value = target.files;
      }
    } else if (config.fromElement) {
      const element = document.getElementById(
        config.fromElement,
      ) as HTMLInputElement;
      if (element) {
        value = element.value;
      }
    }

    // Set nested value in state
    this.setNestedValue(context.elementState, config.dataPath, value);
  }

  /**
   * Handle custom code action
   */
  private handleCustomCode(config: any, context: EventExecutionContext): any {
    try {
      // Create function with safe context
      const fn = new Function(
        "element",
        "event",
        "state",
        "context",
        config.code,
      );
      const result = fn(
        context.element,
        context.event,
        context.elementState,
        context,
      );

      // Return the result (important for condition evaluation)
      return result;
    } catch (error) {
      console.error("Error executing custom code:", error);
      // Return false on error for condition safety
      return false;
    }
  }

  /**
   * Handle scroll action
   */
  private handleScroll(config: any, context: EventExecutionContext): void {
    if (config.target === "elementId") {
      const element = document.getElementById(config.value);
      if (element) {
        element.scrollIntoView({
          behavior: config.behavior || "smooth",
          block: "start",
        });

        // Apply offset if specified
        if (config.offsetY) {
          window.scrollBy(0, config.offsetY);
        }
      }
    } else if (config.target === "position") {
      window.scrollTo({
        top: config.value,
        behavior: config.behavior || "smooth",
      });
    }
  }

  /**
   * Handle modal action
   */
  private handleModal(config: any, context: EventExecutionContext): void {
    const modalId = config.modalId;
    if (!modalId) return;

    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (config.action === "open") {
      modal.style.display = "block";
      modal.setAttribute("aria-hidden", "false");
    } else if (config.action === "close") {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    }
  }

  /**
   * Handle notification action
   */
  private handleNotification(
    config: any,
    _context: EventExecutionContext,
  ): void {
    // Using sonner which is already in your dependencies
    try {
      const sonner = require("sonner");
      if (sonner.toast) {
        sonner.toast[config.notificationType || "info"](config.message, {
          duration: config.duration,
        });
      }
    } catch (error) {
      console.warn("Sonner not available, using fallback notification");
      alert(config.message);
    }
  }

  /**
   * Handle copy to clipboard action
   */
  private async handleCopyToClipboard(
    config: any,
    _context: EventExecutionContext,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(config.text);
      if (config.successMessage) {
        try {
          const sonner = require("sonner");
          if (sonner.toast) {
            sonner.toast.success(config.successMessage);
          }
        } catch {
          console.log("Copied to clipboard");
        }
      }
    } catch (error) {
      console.error("Copy to clipboard failed:", error);
    }
  }

  /**
   * Handle download file action
   */
  private handleDownloadFile(
    config: any,
    _context: EventExecutionContext,
  ): void {
    const link = document.createElement("a");
    link.href = config.url;
    link.download = config.filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Handle play animation action
   */
  private handleAnimation(config: any, _context: EventExecutionContext): void {
    const element = document.getElementById(config.elementId);
    if (!element) return;

    // Apply animation class
    const animationClass = `animate-${config.animationType}`;
    element.classList.add(animationClass);

    // Remove animation class after duration
    const duration = config.duration || 1000;
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, duration);
  }

  /**
   * Handle form actions
   */
  private handleFormAction(config: any, context: EventExecutionContext): void {
    let formElement = document.getElementById(
      config.formElementId || "",
    ) as HTMLFormElement;

    // If no formElementId, find nearest parent form
    if (!formElement && context.elementInstance) {
      formElement = (context.elementInstance as HTMLElement).closest(
        "form",
      ) as HTMLFormElement;
    }

    if (!formElement) return;

    if (config.type === "submitForm") {
      formElement.submit();
    } else if (config.type === "resetForm") {
      formElement.reset();
    }
  }

  /**
   * Handle toggle class action
   */
  private handleToggleClass(
    config: any,
    _context: EventExecutionContext,
  ): void {
    const element = document.getElementById(config.elementId);
    if (!element) return;

    if (config.type === "addClass") {
      element.classList.add(config.className);
    } else if (config.type === "removeClass") {
      element.classList.remove(config.className);
    } else if (config.type === "toggleClass") {
      element.classList.toggle(config.className);
    }
  }

  /**
   * Utility: Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Utility: Set nested value in object
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop();

    if (!lastKey) return;

    const target = keys.reduce((acc, part) => {
      if (!acc[part]) {
        acc[part] = {};
      }
      return acc[part];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Utility: Compare values based on operator
   */
  private compareValues(left: any, operator: string, right: any): boolean {
    switch (operator) {
      case "==":
        return left == right;
      case "!=":
        return left != right;
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      case "includes":
        return String(left).includes(String(right));
      case "notIncludes":
        return !String(left).includes(String(right));
      default:
        return true;
    }
  }
}

export const eventExecutor = new EventExecutor();
