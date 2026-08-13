import { useEffect, useState } from "react";
import { usePreviewQuality, setPreviewQuality } from "./use-preview-quality";

/**
 * Automático "Eco Mode" baseada em Device Memory API e Hardware Concurrency.
 * Reduz a qualidade do preview para "low" se o dispositivo for detectado como tendo pouca memória.
 */
export function useEcoMode() {
  const { quality } = usePreviewQuality();
  const [isEcoActive, setIsEcoActive] = useState(false);

  useEffect(() => {
    // 1. Detectar memória baixa (Device Memory API - Chromium only)
    // Se < 4GB de RAM, ativamos o modo ECO.
    const navigatorAny = navigator as any;
    const isLowMemory = navigatorAny.deviceMemory && navigatorAny.deviceMemory < 4;
    
    // 2. Detectar poucos núcleos (processamento limitado)
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

    if (isLowMemory || isLowPower) {
      if (quality !== "low") {
        console.log("Modo ECO ativado: Detectado dispositivo de baixo desempenho.");
        setPreviewQuality("low");
        setIsEcoActive(true);
      }
    }
  }, [quality]);

  return { isEcoActive };
}
