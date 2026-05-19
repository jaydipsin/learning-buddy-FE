import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, effect, inject } from "@angular/core";
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
    private cdr = inject(ChangeDetectorRef);
    chatStore = inject(ChatStore);
    chatService = inject(ChatService);


    chatMessage: string = '';


    constructor() {
     
    }
    async sendMessage() {
        if (this.chatMessage.trim()) {
            const message = this.chatMessage;
            this.chatMessage = '';
            this.chatStore.chatWithAiMentor(message);
        }
    }

}