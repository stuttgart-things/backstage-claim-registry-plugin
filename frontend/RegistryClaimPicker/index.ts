import { scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { createScaffolderFieldExtension } from '@backstage/plugin-scaffolder-react';
import { RegistryClaimPickerExtension } from './RegistryClaimPickerExtension';

export const RegistryClaimPickerFieldExtension = scaffolderPlugin.provide(
  createScaffolderFieldExtension({
    name: 'RegistryClaimPicker',
    component: RegistryClaimPickerExtension,
  }),
);

// Also export the raw component if needed
export { RegistryClaimPickerExtension };
