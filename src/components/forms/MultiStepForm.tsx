"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAutoSave } from "@/hooks/useAutoSave";

export interface FormStep<TValues> {
  id: string;
  titulo: string;
  descricao?: string;
  render: (ctx: {
    values: TValues;
    setValues: (next: TValues) => void;
    setError: (msg: string | null) => void;
  }) => React.ReactNode;
  validate?: (values: TValues) => string | null;
}

interface MultiStepFormProps<TValues> {
  steps: FormStep<TValues>[];
  initialValues: TValues;
  onComplete: (values: TValues) => void | Promise<void>;
  autoSaveKey?: string;
  textoFinal?: string;
}

export function MultiStepForm<TValues>({
  steps,
  initialValues,
  onComplete,
  autoSaveKey,
  textoFinal = "Confirmar",
}: MultiStepFormProps<TValues>) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<TValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const autoSave = useAutoSave<TValues>({
    key: autoSaveKey ?? "multistep-disabled",
    value: values,
    enabled: Boolean(autoSaveKey),
  });

  useEffect(() => {
    if (!autoSaveKey) return;
    const stored = autoSave.load();
    if (stored) setValues(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey]);

  const step = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLast = stepIndex === steps.length - 1;

  async function avancar() {
    setError(null);
    const validation = step.validate?.(values);
    if (validation) {
      setError(validation);
      return;
    }
    if (isLast) {
      setSubmitting(true);
      try {
        await onComplete(values);
        autoSave.clear();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível concluir.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setStepIndex((s) => s + 1);
    }
  }

  function voltar() {
    setError(null);
    setStepIndex((s) => Math.max(0, s - 1));
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <span className="text-label-caps text-text-3">
            Passo {stepIndex + 1} de {steps.length}
          </span>
          {autoSave.savedAt ? (
            <span className="text-caption text-text-4">
              Rascunho salvo
            </span>
          ) : null}
        </div>
        <Progress value={progress} />
        <div className="flex gap-xs flex-wrap">
          {steps.map((s, idx) => (
            <span
              key={s.id}
              className={cn(
                "text-label-caps px-sm py-xs border",
                idx === stepIndex
                  ? "text-text-1 border-[var(--accent-strong)]"
                  : idx < stepIndex
                    ? "text-text-3 border-border-thin"
                    : "text-text-4 border-border-thin",
              )}
            >
              {s.titulo}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-md">
        <div>
          <h2 className="text-h2 text-text-1">{step.titulo}</h2>
          {step.descricao ? (
            <p className="text-body-md text-text-3 mt-xs">{step.descricao}</p>
          ) : null}
        </div>
        {step.render({ values, setValues, setError })}
      </div>

      {error ? (
        <p className="text-body-sm text-error border border-[rgba(239,68,68,0.30)] bg-[rgba(239,68,68,0.08)] px-md py-sm">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-sm">
        <Button
          variant="secondary"
          onClick={voltar}
          disabled={stepIndex === 0 || submitting}
        >
          Voltar
        </Button>
        <Button onClick={avancar} disabled={submitting}>
          {submitting ? "Salvando…" : isLast ? textoFinal : "Próximo"}
        </Button>
      </div>
    </div>
  );
}
