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
                await chatService.aiChatApi(message, (chunks: string) => {
                    const chatHistory = [...store.chatHistory()];
                    const lastIndex = chatHistory.length - 1;

                    chatHistory[lastIndex] = {
                        ...chatHistory[lastIndex],
                        text: chatHistory[lastIndex].text + chunks
                    };

                    patchState(store, { chatHistory });
                })
            } catch (error: any) {
                patchState(store, { error: error?.message || "Something went wrong" });
            } finally {
                patchState(store, { loading: false })
            }
        }
    }))
)