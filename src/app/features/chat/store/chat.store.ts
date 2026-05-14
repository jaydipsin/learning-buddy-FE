import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ChatService } from "../service/chat.service";
import { inject, Inject } from "@angular/core";

interface IChat {
    chatHistory: any[];
    loading: boolean;
    error: string | null;
}

export const ChatStore = signalStore(
    { providedIn: 'root' },
    withState<IChat>({
        chatHistory: [],
        loading: false,
        error: null,
    }),

    withMethods((store, chatService = inject(ChatService)) => ({
        chatWithAiMentor: async (message: string) => {
            patchState(store, { loading: true })

            const history = store.chatHistory();
            patchState(store, {
                chatHistory: [...history, { from: 'user', text: message }, { from: 'assistant', text: '' }]
            })

            try {
                chatService.aiChatApi(message, (chunk: string) => {
                    setTimeout(() => {
                        patchState(store, (state) => {
                            const currentHistory = [...state.chatHistory];
                            const lastIndex = currentHistory.length - 1;

                            currentHistory[lastIndex] = {
                                ...currentHistory[lastIndex],
                                text: currentHistory[lastIndex].text + (chunk !== 'undefined' ? chunk : '')
                            };

                            return { chatHistory: currentHistory };
                        });
                    }, 0);
                })
            } catch (error: any) {
                patchState(store, { error: error?.message || "Something went wrong" });
            } finally {
                patchState(store, { loading: false })
            }
        },

    }))
)