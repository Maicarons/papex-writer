import Ajv, { type ValidateFunction } from "ajv";
import schema from "../../../resources/latex/papex.schema.json";
import type { PapexManifest } from "./types";
import { assertManifestShape } from "./archive";

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

let cached: ValidateFunction | null = null;

function getValidator(): ValidateFunction {
  if (!cached) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    cached = ajv.compile(schema as object);
  }
  return cached;
}

export function validateManifest(manifest: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  try {
    assertManifestShape(manifest as PapexManifest);
  } catch (e) {
    issues.push({ path: "", message: (e as Error).message });
    return { valid: false, issues };
  }

  const validate = getValidator();
  const ok = validate(manifest);
  if (!ok && validate.errors) {
    for (const err of validate.errors) {
      issues.push({
        path: err.instancePath || "/",
        message: err.message ?? "invalid",
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function validateManifestOrThrow(manifest: unknown): PapexManifest {
  const result = validateManifest(manifest);
  if (!result.valid) {
    const detail = result.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
    throw new Error(`papex.json validation failed: ${detail}`);
  }
  return manifest as PapexManifest;
}
