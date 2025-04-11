      
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