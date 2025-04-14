      
document.addEventListener("DOMContentLoaded", () => {

    const chatbotContainer    = document.getElementById("chatbot-container");    
    const chatbotIcon         = document.getElementById("chatbot-icon");   
    const chatBody            = document.getElementById('chatbot-body');  
    const sendButton          = document.getElementById("send-btn");
    
    const textArea            = document.querySelector("#chat-input textarea"); 

    const chatHeader          = document.getElementById("chatbot-header");
    const headerTextContainer = chatHeader.querySelector(".serive-tag"); 

    const bot_deliver = new Audio("./static/audios/bot.mp3");
    const user_deliver = new Audio("./static/audios/user.mp3");

    const inputInitHeight = textArea.scrollHeight;

    let isChatStarted = false;
    let isWelcomeRun  = false;

    const maxTextAreaHeight = 100;

    chatbotContainer.classList.add("close");

    function toggleChatbot() {
        chatbotContainer.classList.toggle("open");
        chatbotContainer.classList.toggle("close");
        chatbotIcon.style.display = chatbotContainer.classList.contains("open") ? "none" : "flex";

        if (chatbotContainer.classList.contains("open") && !isChatStarted) {
            
            if (!isWelcomeRun) {
                isWelcomeRun = true;                
                chatBody.innerHTML = "";
                showWelcomeMessage();
            }                   
        }
    }

    let offsetX, offsetY;
    
    chatHeader.addEventListener("mousedown", (e) => {
        e.preventDefault(); 
        const rect = chatbotContainer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
    
    function onMouseMove(e) {
        let left = e.clientX - offsetX;
        let top = e.clientY - offsetY;
    
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        const chatWidth = chatbotContainer.offsetWidth;
        const chatHeight = chatbotContainer.offsetHeight;
    
        if (left < 0) {
            left = 0;  
        } else if (left + chatWidth > viewportWidth) {
            left = viewportWidth - chatWidth;  
        }
    
        if (top < 0) {
            top = 0;  
        } else if (top + chatHeight > viewportHeight) {
            top = viewportHeight - chatHeight;  
        }
   
        chatbotContainer.style.left = `${left}px`;
        chatbotContainer.style.top = `${top}px`;
    }
    
    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }     

    function addMessage(content, isBot = false, hasTimestamp = false, isFirstMessage = false, isThink = false) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');
        messageContainer.id = isBot ? 'bot-message' : 'user-message';
    
        const messageTypeDiv = document.createElement('div');
        messageTypeDiv.classList.add(isFirstMessage ? 'message-first' : 'message-next');
        messageTypeDiv.classList.add(isBot ? 'bot' : 'user');
    
        messageTypeDiv.id = isFirstMessage
            ? (isBot ? 'message-first-bot' : 'message-first-user')
            : (isBot ? 'message-next-bot' : 'message-next-user');
    
        const icon = document.createElement('span');
        icon.classList.add('icon');
        icon.id = isFirstMessage ? (isBot ? 'bot-icon' : 'user-icon') : 'empty-icon';
    
        const MessageDiv = document.createElement('div');
        MessageDiv.classList.add(isFirstMessage ? 'first' : 'next');
        MessageDiv.id = isFirstMessage ? 'first-bot-message' : 'next-bot-message';
    
        const Content = document.createElement('p');
        Content.classList.add(isBot ? 'bot-content' : 'user-content');
    
        const timestamp = document.createElement('p');
        timestamp.classList.add('timestamp');
        timestamp.textContent = new Date().toLocaleTimeString().toUpperCase();
    
        if (isBot) {
            messageTypeDiv.appendChild(icon);
    
            if (isThink) {
                Content.textContent = content;
                if (hasTimestamp) {
                    Content.appendChild(timestamp);
                }
                MessageDiv.appendChild(Content);
                messageTypeDiv.appendChild(MessageDiv);
                bot_deliver.play();
                scrollToBottom();
            } else {
                const typingAnimation = document.createElement('span');
                typingAnimation.classList.add('typing-animation');
    
                const thinkingText = document.createElement('p');
                thinkingText.classList.add('thinking-text');
                thinkingText.textContent = 'Thinking';
                scrollToBottom();
    
                for (let i = 0; i < 3; i++) {
                    const dot = document.createElement('span');
                    dot.classList.add('thinking-dot');
                    dot.textContent = '●';
                    typingAnimation.appendChild(dot);
                }
    
                Content.appendChild(thinkingText);
                Content.appendChild(typingAnimation);
    
                MessageDiv.appendChild(Content);
                messageTypeDiv.appendChild(MessageDiv);
    
                setTimeout(() => {
                    messageTypeDiv.removeChild(MessageDiv);
                    Content.textContent = content;
                    if (hasTimestamp) {
                        Content.appendChild(timestamp);
                    }
                    MessageDiv.appendChild(Content);
                    messageTypeDiv.appendChild(MessageDiv);
                    bot_deliver.play();
                    scrollToBottom();
                }, 2000);
            }
        } else {
            Content.textContent = content;
            if (hasTimestamp) {
                Content.appendChild(timestamp);
            }
            MessageDiv.appendChild(Content);
            messageTypeDiv.appendChild(MessageDiv);
            messageTypeDiv.appendChild(icon);
            user_deliver.play();
            scrollToBottom();
        }
    
        messageContainer.appendChild(messageTypeDiv);
    
        if (chatBody) {
            chatBody.appendChild(messageContainer);
        }

        scrollToBottom();
    }
    
    function sendMessage() {     
        
        if (!isChatStarted) return;

        const content = textArea.value.trim();

        if (!content) return;
        if(content) {            
            addMessage(content, false, true, true);
            chatBody.scrollTop = chatBody.scrollHeight;
            addMessage(content, true, true, true);
            textArea.value = ''; 
            textArea.style.height = `${inputInitHeight}px`;
            textArea.style.transform = "translateY(0px)";
            textArea.style.overflowY = "hidden";
        }
    }

    textArea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { 
            event.preventDefault(); 
            sendMessage();
        }
    });     

    textArea.addEventListener("input", () => {
        textArea.style.height = `${inputInitHeight}px`;
        const newHeight = Math.min(textArea.scrollHeight, maxTextAreaHeight);
        const heightDifference = newHeight - inputInitHeight;
        let apptrans = heightDifference > 0 ? `translateY(-${heightDifference / 2}px)` : "translateY(0px)";
        textArea.style.transform = apptrans;
        textArea.style.height = heightDifference > 0 ? `${newHeight}px` : `${inputInitHeight}px`;

        //chatBody.style.height = -heightDifference > 0 ? `${newHeight}px` : `${inputInitHeight}px`;

        textArea.style.overflowY = newHeight === maxTextAreaHeight ? "auto" : "hidden"; 
    });
    
    function showWelcomeMessage() {

        chatBody.innerHTML = "";        

        textArea.style.visibility = "hidden";

        const messages = [
            "Welcome to Neoden India!",
            "Is there anything we can assist you with?"
        ];
        
        messages.forEach((message, index) => {
            setTimeout(() => {
                addMessage(message, true, false, index === 0, true); 
            }, 1000 * index); 
        });
        
        setTimeout(() => {
            showSupportOptions();
        }, 1000 * messages.length + 500);        
    
        scrollToBottom();                
    }

    function showSupportOptions() {

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
    
        const yesButton = document.createElement("button");
        yesButton.textContent = "Yes";
        yesButton.addEventListener("click", showForm);
    
        const noButton = document.createElement("button");
        noButton.textContent = "No";
        noButton.addEventListener("click", shutdownChatBot);
    
        buttonContainer.appendChild(yesButton);
        buttonContainer.appendChild(noButton);
        chatBody.appendChild(buttonContainer);
    
        scrollToBottom();
    }

    function startNewChat() {
        const newChatContainer = document.createElement("div");
        newChatContainer.classList.add("newChatContainer");
    
        const startChatContent = document.createElement("span");
        startChatContent.classList.add("newChatContent");
        startChatContent.textContent = "Start New Chat";

        const startChatButton = document.createElement("span");
        startChatButton.classList.add("newChatButton");
        
        newChatContainer.appendChild(startChatContent);
        newChatContainer.appendChild(startChatButton);

        chatBody.appendChild(newChatContainer);

        startChatButton.addEventListener("click", showForm);
    
        scrollToBottom();
    }  
    
    function showForm() {
        chatBody.innerHTML = "";
    
        const formContainer = document.createElement("div");
        formContainer.classList.add("form-container");
    
        formContainer.innerHTML = `  
            <div class="error-message-container" id="error-message"></div>          
            <input type="text" id="name" required placeholder="Enter your Name"> 
            <input type="text" id="contact" required placeholder="Enter your Contact Number">
            <input type="email" id="email" required placeholder="Enter your email">
            <input type="text" id="company" required placeholder="Enter your Company Name"> 
            <select id="service">
                <option value="" selected>Choose Your Service</option>
                <option value="Sales & Enquiry">Sales & Enquiry</option>
                <option value="Spares & Services">Spares & Services</option>
                <option value="Technical Support">Technical Support</option>
            </select>
            <div class="clear-cancel-continue-container">
                <button class="clear-btn">Clear</button>
                <button class="cancel-btn">Cancel</button>
                <button class="continue-btn" disabled>Continue</button>
            </div>`;
    
        chatBody.appendChild(formContainer);
    
        document.querySelectorAll("input, select").forEach(input => {
            input.addEventListener("input", validateFields);
        });
        document.querySelector(".cancel-btn").addEventListener("click", function() {
            shutdownChatBot();
        });   
        
        document.querySelector(".clear-btn").addEventListener("click", function() {
            document.getElementById("name").value = "";
            document.getElementById("contact").value = "";
            document.getElementById("email").value = "";
            document.getElementById("company").value = "";
            document.getElementById("service").value = "";
            
            const errorMessage = document.getElementById("error-message");
            errorMessage.textContent = "";
            errorMessage.style.display = "none";
        
            document.querySelector(".continue-btn").disabled = true;
        });
        document.querySelector(".continue-btn").addEventListener("click", handleFormSubmit);
    }

    function validateFields() {
        const name = document.getElementById("name").value.trim();
        const contact = document.getElementById("contact").value.trim();
        const email = document.getElementById("email").value.trim();
        const company = document.getElementById("company").value.trim();
        const service = document.getElementById("service").value;
        const continueBtn = document.querySelector(".continue-btn");
        const errorMessage = document.getElementById("error-message");
    
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const namePattern = /^[A-Za-z\s]+$/;
        const contactPattern = /^[0-9+-]+$/;
    
        let message = "";
        
        if (!namePattern.test(name)) {
            message = "Please enter a valid Name";
        } else if (!contactPattern.test(contact)) {
            message = "Invalid Contact Number";
        } else if (!emailPattern.test(email)) {
            message = "Invalid Email Address";
        } else if (!name || !contact || !email || !company || !service) {
            message = "The required fields cannot be left empty";
        }        

        if (message) {
            errorMessage.textContent = message;
            errorMessage.style.display = "block";
            
            errorMessage.classList.remove("slide-up", "slide-down");
            void errorMessage.offsetWidth; 
            
            errorMessage.classList.add("slide-down");
        
            setTimeout(() => {
                errorMessage.classList.replace("slide-down", "slide-up"); 
        
                setTimeout(() => {
                    errorMessage.style.display = "none";
                }, 300); 
            }, 3000);
        } else {
            errorMessage.classList.add("slide-up");
            setTimeout(() => {
                errorMessage.style.display = "none";
                errorMessage.classList.remove("slide-up");
            }, 300);
        }

        continueBtn.disabled = !!message;
    }    
    
    function handleFormSubmit() {
        const name = document.getElementById("name").value.trim();
        const service = document.getElementById("service").value.trim();
        chatBody.innerHTML = "";

        headerTextContainer.textContent = service;

        addMessage(`Thank you, ${name}, for your valuable insights! Your input is deeply appreciated and helps us greatly. 
            
I'm thrilled to assist you further. 
            
Welcome to your chat with NeoDen Bot!`, 
                    true, false, true, true);

        setTimeout(() => {
            closeChat();
            textArea.style.visibility = "visible";
            isChatStarted = true;
        }, 3000);
    }     
    
    function scrollToBottom() {
        chatBody.scrollTo(0, chatBody.scrollHeight);
    }

    function shutdownChatBot() { 
        
        textArea.style.visibility = "hidden";
       
        isChatStarted - false;
        chatBody.innerHTML = "";
        headerTextContainer.textContent = "Chat with us now!";

        addMessage("The chat has been closed or canceled by the user. Thank You!", true, false, false, true);

        setTimeout(() => {
            
            setTimeout(() => {
                chatBody.innerHTML = "";  
                startNewChat();         
            }, 100);     
        }, 3000); 
    }

    function closeChat() {
        const chatbotContainer = document.getElementById('chatbot-container');
    
        const closeChatContainer = document.createElement("div");
        closeChatContainer.classList.add("closechat");
    
        const closeChatButton = document.createElement("span");
        closeChatButton.classList.add("close-chat-button");
    
        closeChatContainer.appendChild(closeChatButton);
        chatbotContainer.appendChild(closeChatContainer);
    
        closeChatButton.addEventListener("click", function () {
            closeChatButton.style.visibility = "hidden";
            const dialogBox = document.createElement('div');
            dialogBox.classList.add('dialog-box');
    
            const dialogText = document.createElement('p');
            dialogText.textContent = 'Do you want to Quit the chat?';
            dialogBox.appendChild(dialogText);
    
            const noButton = document.createElement('button');
            noButton.textContent = 'No';
            noButton.classList.add('no-btn');
            noButton.addEventListener('click', function () {
                closeChatButton.style.visibility = "visible";
                chatbotContainer.removeChild(dialogBox);
            });
            dialogBox.appendChild(noButton);
    
            const yesButton = document.createElement('button');
            yesButton.textContent = 'Yes';
            yesButton.classList.add('yes-btn');
            yesButton.addEventListener('click', function () {
                closeChatButton.enabled;                
                shutdownChatBot();
                chatbotContainer.removeChild(dialogBox);
            });
            dialogBox.appendChild(yesButton);
    
            chatbotContainer.appendChild(dialogBox);
        });
    }    

    sendButton.addEventListener("click", sendMessage);

    window.toggleChatbot = toggleChatbot;
    
});
/*document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const elements = {
        chatbotContainer: document.getElementById("chatbot-container"),
        chatbotIcon: document.getElementById("chatbot-icon"),
        chatBody: document.getElementById('chatbot-body'),
        sendButton: document.getElementById("send-btn"),
        textArea: document.querySelector("#chat-input textarea"),
        chatHeader: document.getElementById("chatbot-header"),
        headerTextContainer: document.querySelector(".serive-tag"),
    };

    // Audio elements
    const audio = {
        bot: new Audio("./static/audios/bot.mp3"),
        user: new Audio("./static/audios/user.mp3")
    };

    // Constants
    const constants = {
        maxTextAreaHeight: 100,
        inputInitHeight: elements.textArea.scrollHeight,
        typingDelay: 2000,
        messageDelay: 1000
    };

    // State management
    const state = {
        isChatStarted: false,
        isWelcomeRun: false,
        isDragging: false,
        dragOffset: { x: 0, y: 0 }
    };

    // Initialize chatbot
    elements.chatbotContainer.classList.add("close");

    // Event Listeners
    function setupEventListeners() {
        // Chat toggle
        elements.chatbotIcon.addEventListener("click", toggleChatbot);
        
        // Drag functionality
        elements.chatHeader.addEventListener("mousedown", startDrag);
        
        // Message input
        elements.textArea.addEventListener('keydown', handleKeyDown);
        elements.textArea.addEventListener("input", handleTextAreaInput);
        
        // Send button
        elements.sendButton.addEventListener("click", sendMessage);
    }

    // Core Functions
    function toggleChatbot() {
        elements.chatbotContainer.classList.toggle("open");
        elements.chatbotContainer.classList.toggle("close");
        elements.chatbotIcon.style.display = elements.chatbotContainer.classList.contains("open") ? "none" : "flex";

        if (elements.chatbotContainer.classList.contains("open") && !state.isChatStarted) {
            if (!state.isWelcomeRun) {
                state.isWelcomeRun = true;
                showWelcomeMessage();
            }
        }
    }

    function startDrag(e) {
        e.preventDefault();
        const rect = elements.chatbotContainer.getBoundingClientRect();
        state.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        state.isDragging = true;
        
        document.addEventListener("mousemove", handleDrag);
        document.addEventListener("mouseup", stopDrag);
    }

    function handleDrag(e) {
        if (!state.isDragging) return;
        
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        const chatDimensions = {
            width: elements.chatbotContainer.offsetWidth,
            height: elements.chatbotContainer.offsetHeight
        };
        
        let left = Math.max(0, Math.min(e.clientX - state.dragOffset.x, viewport.width - chatDimensions.width));
        let top = Math.max(0, Math.min(e.clientY - state.dragOffset.y, viewport.height - chatDimensions.height));
        
        elements.chatbotContainer.style.left = `${left}px`;
        elements.chatbotContainer.style.top = `${top}px`;
    }

    function stopDrag() {
        state.isDragging = false;
        document.removeEventListener("mousemove", handleDrag);
        document.removeEventListener("mouseup", stopDrag);
    }

    function addMessage(content, options = {}) {
        const {
            isBot = false,
            hasTimestamp = false,
            isFirstMessage = false,
            isThink = false
        } = options;
        
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message';
        messageContainer.id = isBot ? 'bot-message' : 'user-message';
        
        const messageTypeDiv = document.createElement('div');
        messageTypeDiv.className = `${isFirstMessage ? 'message-first' : 'message-next'} ${isBot ? 'bot' : 'user'}`;
        messageTypeDiv.id = isFirstMessage 
            ? (isBot ? 'message-first-bot' : 'message-first-user')
            : (isBot ? 'message-next-bot' : 'message-next-user');
        
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.id = isFirstMessage ? (isBot ? 'bot-icon' : 'user-icon') : 'empty-icon';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = isFirstMessage ? 'first' : 'next';
        messageDiv.id = isFirstMessage ? 'first-bot-message' : 'next-bot-message';
        
        const contentElement = document.createElement('p');
        contentElement.className = isBot ? 'bot-content' : 'user-content';
        
        if (hasTimestamp) {
            const timestamp = document.createElement('p');
            timestamp.className = 'timestamp';
            timestamp.textContent = new Date().toLocaleTimeString().toUpperCase();
            contentElement.appendChild(timestamp);
        }
        
        if (isBot) {
            messageTypeDiv.appendChild(icon);
            
            if (isThink) {
                contentElement.textContent = content;
                messageDiv.appendChild(contentElement);
                messageTypeDiv.appendChild(messageDiv);
                audio.bot.play();
            } else {
                createTypingAnimation(messageDiv, contentElement, content);
                messageTypeDiv.appendChild(messageDiv);
                
                setTimeout(() => {
                    messageDiv.innerHTML = '';
                    contentElement.textContent = content;
                    messageDiv.appendChild(contentElement);
                    audio.bot.play();
                }, constants.typingDelay);
            }
        } else {
            contentElement.textContent = content;
            messageDiv.appendChild(contentElement);
            messageTypeDiv.appendChild(messageDiv);
            messageTypeDiv.appendChild(icon);
            audio.user.play();
        }
        
        messageContainer.appendChild(messageTypeDiv);
        elements.chatBody.appendChild(messageContainer);
        scrollToBottom();
    }

    function createTypingAnimation(container, contentElement, finalContent) {
        const typingAnimation = document.createElement('span');
        typingAnimation.className = 'typing-animation';
        
        const thinkingText = document.createElement('p');
        thinkingText.className = 'thinking-text';
        thinkingText.textContent = 'Thinking';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            dot.className = 'thinking-dot';
            dot.textContent = '●';
            typingAnimation.appendChild(dot);
        }
        
        contentElement.appendChild(thinkingText);
        contentElement.appendChild(typingAnimation);
        container.appendChild(contentElement);
    }

    function sendMessage() {
        if (!state.isChatStarted) return;
        
        const content = elements.textArea.value.trim();
        if (!content) return;
        
        addMessage(content, { isBot: false, hasTimestamp: true, isFirstMessage: true });
        addMessage(content, { isBot: true, hasTimestamp: true, isFirstMessage: true });
        
        // Reset textarea
        elements.textArea.value = '';
        elements.textArea.style.height = `${constants.inputInitHeight}px`;
        elements.textArea.style.transform = "translateY(0px)";
        elements.textArea.style.overflowY = "hidden";
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function handleTextAreaInput() {
        elements.textArea.style.height = `${constants.inputInitHeight}px`;
        const newHeight = Math.min(elements.textArea.scrollHeight, constants.maxTextAreaHeight);
        const heightDifference = newHeight - constants.inputInitHeight;
        
        elements.textArea.style.transform = heightDifference > 0 
            ? `translateY(-${heightDifference / 2}px)` 
            : "translateY(0px)";
            
        elements.textArea.style.height = heightDifference > 0 
            ? `${newHeight}px` 
            : `${constants.inputInitHeight}px`;
            
        elements.textArea.style.overflowY = newHeight === constants.maxTextAreaHeight 
            ? "auto" 
            : "hidden";
    }

    function showWelcomeMessage() {
        elements.chatBody.innerHTML = "";
        elements.textArea.style.visibility = "hidden";
        
        const messages = [
            "Welcome to Neoden India!",
            "Is there anything we can assist you with?"
        ];
        
        messages.forEach((message, index) => {
            setTimeout(() => {
                addMessage(message, { 
                    isBot: true, 
                    isFirstMessage: index === 0, 
                    isThink: true 
                });
            }, constants.messageDelay * index);
        });
        
        setTimeout(showSupportOptions, constants.messageDelay * messages.length + 500);
    }

    function showSupportOptions() {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        
        const buttons = [
            { text: "Yes", action: showForm },
            { text: "No", action: shutdownChatBot }
        ];
        
        buttons.forEach(button => {
            const btn = document.createElement("button");
            btn.textContent = button.text;
            btn.addEventListener("click", button.action);
            buttonContainer.appendChild(btn);
        });
        
        elements.chatBody.appendChild(buttonContainer);
    }

    function startNewChat() {
        elements.chatBody.innerHTML = '';
        
        const newChatContainer = document.createElement("div");
        newChatContainer.className = "newChatContainer";
        
        const startChatContent = document.createElement("span");
        startChatContent.className = "newChatContent";
        startChatContent.textContent = "Start New Chat";
        
        const startChatButton = document.createElement("span");
        startChatButton.className = "newChatButton";
        startChatButton.addEventListener("click", showForm);
        
        newChatContainer.append(startChatContent, startChatButton);
        elements.chatBody.appendChild(newChatContainer);
    }

    function showForm() {
        elements.chatBody.innerHTML = '';
        
        const formContainer = document.createElement("div");
        formContainer.className = "form-container";
        formContainer.innerHTML = `  
            <div class="error-message-container" id="error-message"></div>          
            <input type="text" id="name" required placeholder="Enter your Name"> 
            <input type="text" id="contact" required placeholder="Enter your Contact Number">
            <input type="email" id="email" required placeholder="Enter your email">
            <input type="text" id="company" required placeholder="Enter your Company Name"> 
            <select id="service">
                <option value="" selected>Choose Your Service</option>
                <option value="Sales & Enquiry">Sales & Enquiry</option>
                <option value="Spares & Services">Spares & Services</option>
                <option value="Technical Support">Technical Support</option>
            </select>
            <div class="clear-cancel-continue-container">
                <button class="clear-btn">Clear</button>
                <button class="cancel-btn">Cancel</button>
                <button class="continue-btn" disabled>Continue</button>
            </div>`;
        
        elements.chatBody.appendChild(formContainer);
        
        // Form event listeners
        document.querySelectorAll("input, select").forEach(input => {
            input.addEventListener("input", validateFields);
        });
        
        document.querySelector(".cancel-btn").addEventListener("click", shutdownChatBot);
        document.querySelector(".clear-btn").addEventListener("click", clearForm);
        document.querySelector(".continue-btn").addEventListener("click", handleFormSubmit);
    }

    function validateFields() {
        const formData = {
            name: document.getElementById("name").value.trim(),
            contact: document.getElementById("contact").value.trim(),
            email: document.getElementById("email").value.trim(),
            company: document.getElementById("company").value.trim(),
            service: document.getElementById("service").value
        };
        
        const continueBtn = document.querySelector(".continue-btn");
        const errorMessage = document.getElementById("error-message");
        
        const validation = validateFormData(formData);
        
        if (validation.isValid) {
            hideErrorMessage(errorMessage);
        } else {
            showErrorMessage(errorMessage, validation.message);
        }
        
        continueBtn.disabled = !validation.isValid;
    }

    function validateFormData(formData) {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const namePattern = /^[A-Za-z\s]+$/;
        const contactPattern = /^[0-9+-]+$/;
        
        if (!namePattern.test(formData.name)) {
            return { isValid: false, message: "Please enter a valid Name" };
        }
        
        if (!contactPattern.test(formData.contact)) {
            return { isValid: false, message: "Invalid Contact Number" };
        }
        
        if (!emailPattern.test(formData.email)) {
            return { isValid: false, message: "Invalid Email Address" };
        }
        
        if (!formData.name || !formData.contact || !formData.email || !formData.company || !formData.service) {
            return { isValid: false, message: "The required fields cannot be left empty" };
        }
        
        return { isValid: true };
    }

    function showErrorMessage(element, message) {
        element.textContent = message;
        element.style.display = "block";
        
        element.classList.remove("slide-up", "slide-down");
        void element.offsetWidth; // Trigger reflow
        
        element.classList.add("slide-down");
        
        setTimeout(() => {
            element.classList.replace("slide-down", "slide-up");
            setTimeout(() => element.style.display = "none", 300);
        }, 3000);
    }

    function hideErrorMessage(element) {
        element.classList.add("slide-up");
        setTimeout(() => {
            element.style.display = "none";
            element.classList.remove("slide-up");
        }, 300);
    }

    function clearForm() {
        ['name', 'contact', 'email', 'company', 'service'].forEach(id => {
            document.getElementById(id).value = "";
        });
        
        const errorMessage = document.getElementById("error-message");
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
        
        document.querySelector(".continue-btn").disabled = true;
    }

    function handleFormSubmit() {
        const name = document.getElementById("name").value.trim();
        const service = document.getElementById("service").value.trim();
        
        elements.chatBody.innerHTML = "";
        elements.headerTextContainer.textContent = service;
        
        addMessage(
            `Thank you, ${name}, for your valuable insights! Your input is deeply appreciated and helps us greatly. 
            
I'm thrilled to assist you further. 
            
Welcome to your chat with NeoDen Bot!`, 
            { isBot: true, isFirstMessage: true, isThink: true }
        );
        
        setTimeout(() => {
            setupCloseChatButton();
            elements.textArea.style.visibility = "visible";
            state.isChatStarted = true;
        }, 3000);
    }

    function setupCloseChatButton() {
        const closeChatContainer = document.createElement("div");
        closeChatContainer.className = "closechat";
        
        const closeChatButton = document.createElement("span");
        closeChatButton.className = "close-chat-button";
        closeChatButton.addEventListener("click", showExitConfirmation);
        
        closeChatContainer.appendChild(closeChatButton);
        elements.chatbotContainer.appendChild(closeChatContainer);
    }

    function showExitConfirmation() {
        const dialogBox = document.createElement('div');
        dialogBox.className = 'dialog-box';
        
        dialogBox.innerHTML = `
            <p>Do you want to Quit the chat?</p>
            <button class="no-btn">No</button>
            <button class="yes-btn">Yes</button>
        `;
        
        dialogBox.querySelector('.no-btn').addEventListener('click', () => {
            elements.chatbotContainer.removeChild(dialogBox);
        });
        
        dialogBox.querySelector('.yes-btn').addEventListener('click', () => {
            shutdownChatBot();
            elements.chatbotContainer.removeChild(dialogBox);
        });
        
        elements.chatbotContainer.appendChild(dialogBox);
    }

    function shutdownChatBot() {
        elements.textArea.style.visibility = "hidden";
        state.isChatStarted = false;
        elements.chatBody.innerHTML = "";
        elements.headerTextContainer.textContent = "Chat with us now!";
        
        addMessage(
            "The chat has been closed or canceled by the user. Thank You!", 
            { isBot: true, isThink: true }
        );
        
        setTimeout(() => {
            elements.chatBody.innerHTML = "";
            startNewChat();
        }, 3000);
    }

    function scrollToBottom() {
        elements.chatBody.scrollTo(0, elements.chatBody.scrollHeight);
    }

    // Initialize
    setupEventListeners();
    window.toggleChatbot = toggleChatbot;
});*/