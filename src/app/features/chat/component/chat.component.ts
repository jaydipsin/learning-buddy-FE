import { CommonModule } from "@angular/common";
import { Component, effect, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChatStore } from "../store/chat.store";
import { ChatService } from "../service/chat.service";

@Component({
    selector: "app-chat",
    templateUrl: "./chat.component.html",
    styleUrls: ["./chat.component.css"],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class ChatComponent {

    chatStore = inject(ChatStore);
    chatService = inject(ChatService);


    chatMessage: string = '';
    chatMessages: any[] = [];

    constructor() {
        effect(() => {
            this.chatMessages = this.chatStore.chatHistory();
            console.log(this.chatMessages);
        })
    }

    sendMessage() {
        if (this.chatMessage.trim()) {
            const message = this.chatMessage;
            this.chatMessage = '';
            this.chatStore.chatWithAiMentor(message);
        }
    }

}