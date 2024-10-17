import { test } from '@playwright/test';

export function step(stepName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Debug logging to help understand the context
    console.log('Target:', target);
    console.log('PropertyKey:', propertyKey);
    console.log('Descriptor:', descriptor);

    // Ensure descriptor exists and is applied to a method
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('Step decorator can only be applied to methods.');
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const stepDisplayName = stepName || propertyKey;
      return await test.step(stepDisplayName, async () => {
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
