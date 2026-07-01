import { effect } from '@angular/core';
import { getState, patchState, signalStoreFeature, withHooks } from '@ngrx/signals';

export function withDevtools(name: string) {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        const win = window as any;
        const devToolsExtension = win.__REDUX_DEVTOOLS_EXTENSION__;
        if (!devToolsExtension) {
          return;
        }

        const devTools = devToolsExtension.connect({
          name,
        });

        let isUpdatingFromDevTools = false;
        devTools.init(getState(store));

        // Listen for actions from Redux DevTools (e.g. time travel / jump)
        devTools.subscribe((message: any) => {
          if (
            message.type === 'DISPATCH' &&
            (message.payload.type === 'JUMP_TO_ACTION' || message.payload.type === 'JUMP_TO_STATE')
          ) {
            const state = JSON.parse(message.state);
            isUpdatingFromDevTools = true;
            patchState(store, state);
            isUpdatingFromDevTools = false;
          }
        });

        // Set up effect to sync state to DevTools when it changes from the app
        effect(() => {
          const state = getState(store);
          if (!isUpdatingFromDevTools) {
            devTools.send({ type: `[${name}] State Updated` }, state);
          }
        });
      },
    })
  );
}
