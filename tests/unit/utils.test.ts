import { describe, expect, test } from "bun:test";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  test("merges class names", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  test("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  test("handles false conditions", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class");
  });

  test("handles undefined values", () => {
    const result = cn("base-class", undefined, null);
    expect(result).toBe("base-class");
  });

  test("merges tailwind classes correctly", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  test("handles array of classes", () => {
    const result = cn(["class1", "class2"]);
    expect(result).toBe("class1 class2");
  });

  test("handles object syntax", () => {
    const result = cn({ "text-red-500": true, "bg-blue-500": false });
    expect(result).toBe("text-red-500");
  });

  test("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});
